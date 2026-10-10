'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

export function ConsultationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedWhatsAppUrl, setConfirmedWhatsAppUrl] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceRequested, setServiceRequested] = useState('Free In-Home Measurement / Site Visit');
  const [preferredTimeframe, setPreferredTimeframe] = useState('');
  const [siteLocationAndScope, setSiteLocationAndScope] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const idempotencyKey = `cons_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const cleanPhone = phone.replace(/\D/g, '');

      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMessage('Please enter a valid phone number with at least 10 digits.');
        setIsSubmitting(false);
        return;
      }

      const address = siteLocationAndScope.trim() || 'Showroom Consultation (Site location to be confirmed via phone)';
      const preferredDate = preferredTimeframe.trim() || 'Flexible / Coordinator Scheduled';
      const preferredTimeSlot = 'Showroom Coordinated';
      const customerNotes = `Service: ${serviceRequested}\nTimeframe: ${preferredTimeframe.trim() || 'Flexible'}\nProject Scope & Location: ${siteLocationAndScope.trim() || 'Not specified'}`;

      const res = await fetch('/api/measurement-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: cleanPhone,
          serviceRequested,
          address,
          preferredDate,
          preferredTimeSlot,
          customerNotes,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit consultation request. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setConfirmedWhatsAppUrl(data.whatsappUrl || 'https://wa.me/917947415666');
      setSubmitted(true);
      setName('');
      setPhone('');
      setPreferredTimeframe('');
      setSiteLocationAndScope('');
      setServiceRequested('Free In-Home Measurement / Site Visit');
    } catch (err: any) {
      console.error('Consultation form submission error:', err);
      setErrorMessage('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white border border-[#9A7B56] text-center shadow-xs">
        <div className="w-10 h-10 mx-auto bg-[#FAF7F2] flex items-center justify-center text-[#9A7B56] mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="font-serif text-[22px] text-[#1C1917] mb-2">
          Consultation Request Confirmed
        </h4>
        <p className="text-[13px] text-[#57534E] leading-relaxed max-w-md mx-auto mb-6">
          Thank you. Our showroom coordinator has received your request and will contact you via phone/WhatsApp to confirm your laser measurement schedule.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {confirmedWhatsAppUrl && (
            <a
              href={confirmedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#20BA5C] text-white text-[12px] font-semibold tracking-wider rounded-lg shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Instant WhatsApp Confirmation</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setErrorMessage(null);
            }}
            className="px-6 py-2.5 text-[11px] uppercase tracking-wider font-medium bg-[#1C1917] text-white hover:bg-[#9A7B56] transition-colors rounded-lg cursor-pointer"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] leading-relaxed">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            placeholder="Your full name"
            className="w-full px-4 py-3 bg-white border border-[#E7E2D8] text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
            placeholder="Your mobile number"
            className="w-full px-4 py-3 bg-white border border-[#E7E2D8] text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Service Requested
          </label>
          <select
            value={serviceRequested}
            onChange={(e) => setServiceRequested(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-white border border-[#E7E2D8] text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60 rounded-xl"
          >
            <option>Free In-Home Measurement / Site Visit</option>
            <option>Doorstep Fabric / Sample Demo</option>
            <option>Custom Tailoring & Stitching</option>
            <option>Motorization / Smart Home Setup</option>
            <option>NRI Remote Home Styling</option>
            <option>Corporate / Institutional Furnishings</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Preferred Timeframe
          </label>
          <input
            type="text"
            value={preferredTimeframe}
            onChange={(e) => setPreferredTimeframe(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. This Weekend / Next Tuesday"
            className="w-full px-4 py-3 bg-white border border-[#E7E2D8] text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60 rounded-xl"
          />
        </div>
      </div>

      <div>
        <label className="block text-[12px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
          Site Location & Project Scope
        </label>
        <textarea
          rows={3}
          value={siteLocationAndScope}
          onChange={(e) => setSiteLocationAndScope(e.target.value)}
          disabled={isSubmitting}
          placeholder="Describe your rooms, number of windows, or specific fabric styles you wish to view..."
          className="w-full px-4 py-3 bg-white border border-[#E7E2D8] text-[16px] sm:text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60 rounded-xl"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#1C1714] text-[#FDFBF7] text-[12px] uppercase tracking-[0.2em] font-medium hover:bg-[#9A7B56] transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer rounded-xl"
      >
        {isSubmitting ? 'Submitting Request...' : 'Submit Consultation Request'}
      </button>
    </form>
  );
}
