'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Ruler,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { ZAIRA_WHATSAPP_NUMBER } from '@/lib/whatsapp';

const POPULAR_AREAS = [
  'Puppalguda',
  'Kokapet',
  'Financial District',
  'Gachibowli',
  'Jubilee Hills',
  'Banjara Hills',
  'Kondapur',
  'Manikonda',
  'Hitec City',
  'Other Hyderabad Area',
];

const CATEGORY_CHIPS = [
  'Curtains & Drapes',
  'Window Blinds',
  'Sofa Fabrics & Upholstery',
  'Wallpapers',
  'Wooden Flooring',
  'Mattresses & Rugs',
];

const TIME_SLOTS = [
  'Morning (10:00 AM – 1:00 PM)',
  'Afternoon (2:00 PM – 5:00 PM)',
  'Evening (5:00 PM – 8:00 PM)',
];

export function BookingModal() {
  const { isBookingModalOpen, setIsBookingModalOpen, bookingService } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedArea, setSelectedArea] = useState('Puppalguda');
  const [addressDetails, setAddressDetails] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Curtains & Drapes',
  ]);
  const [preferredDateSlot, setPreferredDateSlot] = useState('Earliest Slot');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (10:00 AM – 1:00 PM)');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isBookingModalOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const resetAndClose = () => {
    setIsBookingModalOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setErrorMessage(null);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const generatedRef = `ZAI-${Date.now().toString().slice(-6)}`;
    const fullAddress = `${selectedArea}${addressDetails.trim() ? `, ${addressDetails.trim()}` : ''}`;
    const serviceName = bookingService || 'Free In-Home Measurement';

    const customerNotes = [
      `Service: ${serviceName}`,
      `Interested in: ${selectedCategories.join(', ') || 'Custom Furnishings'}`,
      `Locality: ${fullAddress}`,
      `Slot: ${preferredDateSlot} • ${preferredTimeSlot}`,
    ].join('\n');

    const whatsappText = encodeURIComponent(
      `Hello Zaira Furnishing,\n\nI want to book a free in-home measurement visit.\n\n• Name: ${customerName.trim()}\n• Phone: ${cleanPhone}\n• Area: ${fullAddress}\n• Interested in: ${selectedCategories.join(', ') || 'General Furnishings'}\n• Preferred Time: ${preferredDateSlot} (${preferredTimeSlot})\n• Booking Ref: ${generatedRef}\n\nPlease confirm availability.`
    );

    const targetWhatsAppUrl = `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${whatsappText}`;

    try {
      // 1. Record lead to server database in background
      await fetch('/api/measurement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          serviceRequested: serviceName,
          address: fullAddress,
          preferredDate: preferredDateSlot,
          preferredTimeSlot,
          customerNotes,
          idempotencyKey: `meas_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        }),
      }).catch((err) => console.warn('Background lead record failed:', err));

      // 2. Open WhatsApp immediately
      window.open(targetWhatsAppUrl, '_blank');

      setBookingRef(generatedRef);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      // Even if API fails, user can proceed to WhatsApp
      window.open(targetWhatsAppUrl, '_blank');
      setBookingRef(generatedRef);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackWhatsAppMessage = encodeURIComponent(
    `Hello Zaira Furnishing,\n\nI want to book a free in-home measurement visit.\n\n• Name: ${customerName.trim()}\n• Phone: ${customerPhone.replace(/\D/g, '')}\n• Area: ${selectedArea}\n• Interested in: ${selectedCategories.join(', ')}\n• Booking Ref: ${bookingRef}\n\nPlease confirm availability.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#FDFBF7] rounded-2xl sm:rounded-3xl border border-[#EAE4D8] shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="relative bg-[#1C1714] text-white p-5 sm:p-6 shrink-0 border-b border-[#9A7B56]/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4AF37] text-[10px] uppercase tracking-widest font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>100% Free Doorstep Visit • Hyderabad</span>
              </div>
              <h3 className="font-serif text-[20px] sm:text-[24px] font-semibold tracking-tight text-white">
                Book Free In-Home Measurement
              </h3>
              <p className="text-[12px] sm:text-[13px] text-[#C4B9A1] font-light mt-1">
                We bring 500+ curated swatches & laser measurement tools to your doorstep.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Body Content ─── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[12px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            /* ─── Confirmation Screen ─── */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] mx-auto animate-in zoom-in duration-300">
                <CheckCircle2 className="w-7 h-7 text-[#25D366]" />
              </div>

              <div>
                <span className="text-[10.5px] uppercase tracking-widest font-semibold text-[#9A7B56]">
                  Request Sent Successfully
                </span>
                <h4 className="font-serif text-[22px] sm:text-[24px] font-semibold text-[#1C1917] mt-1">
                  Thank You, {customerName}
                </h4>
                <p className="text-[13px] text-[#57534E] max-w-sm mx-auto mt-1.5 leading-relaxed">
                  Your reference is <strong className="text-[#9A7B56] font-semibold">{bookingRef}</strong>. WhatsApp has been opened with your pre-filled details.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8] text-left text-[12.5px] space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between pb-1.5 border-b border-[#EAE4D8]">
                  <span className="text-[#78716C]">Area:</span>
                  <span className="font-medium text-[#1C1917]">{selectedArea}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#EAE4D8]">
                  <span className="text-[#78716C]">Preferred Slot:</span>
                  <span className="font-medium text-[#1C1917]">{preferredDateSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Items:</span>
                  <span className="font-medium text-[#1C1917] truncate max-w-[240px]">
                    {selectedCategories.join(', ')}
                  </span>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <a
                  href={`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${fallbackWhatsAppMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20BA5C] text-white font-medium text-[13px] shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Open WhatsApp Again</span>
                </a>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D5CDBC] text-[#57534E] hover:text-[#1C1917] text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[14px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D5CDBC] rounded-xl text-[14px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                  />
                </div>
              </div>

              {/* Hyderabad Locality Pills */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                  Select Your Locality in Hyderabad
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-[#D5CDBC] rounded-xl">
                  {POPULAR_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedArea(area)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedArea === area
                          ? 'bg-[#1C1714] text-white shadow-2xs'
                          : 'bg-[#FAF7F2] text-[#57534E] hover:bg-[#EAE4D8]'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apartment / Colony (Optional) */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                  Apartment, Villa or Colony Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Home Bhooja, Flat 502"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#D5CDBC] rounded-xl text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              {/* What are you looking for? (Category Chips) */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1.5">
                  What Furnishings Are You Looking For?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {CATEGORY_CHIPS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-2 rounded-lg border text-left text-[11.5px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1714] border-[#1C1714] text-white'
                            : 'bg-white border-[#EAE4D8] text-[#1C1917] hover:border-[#9A7B56]'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5] ml-1 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                    Preferred Day
                  </label>
                  <select
                    value={preferredDateSlot}
                    onChange={(e) => setPreferredDateSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBC] rounded-xl text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                  >
                    <option value="Earliest Available">Earliest Available</option>
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Weekend">This Weekend</option>
                    <option value="Next Week">Next Week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#57534E] mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CDBC] rounded-xl text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trust Strip */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4D8] text-[11px] text-[#57534E]">
                <ShieldCheck className="w-4 h-4 text-[#9A7B56] shrink-0" />
                <span>100% Free site measurement • Fabric swatches demo • No obligation</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#20BA5C] text-white font-semibold text-[14px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <MessageSquare className="w-4.5 h-4.5 fill-white" />
                <span>{isSubmitting ? 'Opening WhatsApp...' : 'Book on WhatsApp'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
