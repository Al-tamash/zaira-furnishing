'use client';

import React, { useState } from 'react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Bespoke Drapery & Blinds');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const idempotencyKey = `ci_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to send your message. Please check the details and try again.');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setSubject('Bespoke Drapery & Blinds');
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setErrorMessage('A network error occurred. Please verify your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-[#FAF7F2] border border-[#9A7B56] text-center">
        <h3 className="font-serif text-[20px] text-[#1C1917] mb-2">Message Received</h3>
        <p className="text-[13px] text-[#57534E] mb-4">
          Thank you for reaching out. Our showroom coordinator will respond to your inquiry shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setErrorMessage(null);
          }}
          className="px-5 py-2 text-[11px] uppercase tracking-wider font-medium border border-[#1C1917] text-[#1C1917]"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] leading-relaxed">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Eleanor Vance"
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E7E2D8] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E7E2D8] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. eleanor@example.com"
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E7E2D8] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
            Nature of Inquiry
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E7E2D8] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60"
          >
            <option>Bespoke Drapery & Blinds</option>
            <option>Sofa Re-upholstery & Fabric Selection</option>
            <option>In-Home Laser Site Measurement</option>
            <option>Wooden Flooring / Carpet Inquiry</option>
            <option>Architect / Interior Designer Collaboration</option>
            <option>Other Catalog Inquiry</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#1C1917] font-medium mb-1.5">
          Message / Project Scope
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
          placeholder="Tell us about your rooms, number of windows, preferred textures, or timeline..."
          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E7E2D8] text-[13px] text-[#1C1917] focus:outline-hidden focus:border-[#1C1917] disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#1C1917] text-[#FDFBF7] text-[12px] uppercase tracking-[0.2em] font-medium hover:bg-[#9A7B56] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? 'Sending Message...' : 'Send Message'}
      </button>
    </form>
  );
}
