'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { DbContactInquiry } from '@/lib/db/types';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<DbContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<DbContactInquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('limit', '50');

      const res = await fetch(`/api/contact?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch contact inquiries');
      }
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading inquiries.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInquiries]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
        );
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ARCHIVED':
        return 'bg-stone-200 text-stone-700 border-stone-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1917]">
            Contact Inquiries
          </h1>
          <p className="text-[13px] text-[#78716C] mt-1">
            Review customer messages and bespoke styling requests submitted via the storefront contact page.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E7E2D8] text-[13px] font-medium text-[#1C1917] rounded-xl hover:bg-[#FAF7F2] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE4D8] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or message..."
            className="w-full pl-10 pr-4 py-2 text-[13px] bg-[#FAF7F2] border border-[#E7E2D8] rounded-xl focus:outline-hidden focus:border-[#9A7B56] text-[#1C1917]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'NEW', 'CONTACTED', 'RESOLVED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase rounded-lg transition-colors shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#78716C] hover:bg-[#EAE4D8] hover:text-[#1C1917]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-[#EAE4D8] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 border-2 border-[#9A7B56] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-[#78716C]">Loading customer inquiries...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600">
            <p className="text-[14px] font-medium">{error}</p>
            <button
              onClick={fetchInquiries}
              className="mt-3 px-4 py-1.5 text-[12px] bg-rose-50 border border-rose-200 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-10 h-10 text-[#C4B9A1] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-[17px] text-[#1C1917]">No inquiries found</h3>
            <p className="text-[13px] text-[#78716C] mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try broadening your search or resetting filters.'
                : 'Customer inquiries submitted via the website contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EAE4D8] text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
                  <th className="py-3 px-4">Ref & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D8]/60">
                {inquiries.map((inq) => {
                  const cleanPhone = (inq.phone || '').replace(/\D/g, '');
                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInquiry(inq)}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11.5px] font-semibold text-[#1C1917] block">
                          {inq.inquiry_number}
                        </span>
                        <span className="text-[11px] text-[#78716C]">
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-[#1C1917] block">{inq.name}</span>
                        <div className="flex items-center gap-3 text-[11.5px] text-[#78716C] mt-0.5">
                          <span>{inq.phone}</span>
                          <span>•</span>
                          <span className="truncate max-w-[160px]">{inq.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-[#1C1917] block">
                          {inq.subject || 'General Inquiry'}
                        </span>
                        <p className="text-[11.5px] text-[#78716C] line-clamp-1 max-w-sm mt-0.5">
                          {inq.message}
                        </p>
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inq.status}
                          disabled={updatingId === inq.id}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md border text-left cursor-pointer focus:outline-hidden ${getStatusBadge(
                            inq.status
                          )}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                                `Hello ${inq.name}, thank you for contacting Zaira Furnishing regarding "${inq.subject}". How can our team assist you today?`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                              title="Chat on WhatsApp"
                            >
                              <span>WhatsApp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100 rounded-lg"
                            title="View Full Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#EAE4D8] shadow-2xl max-w-lg w-full overflow-hidden my-auto flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#EAE4D8] flex items-center justify-between">
              <div>
                <span className="font-mono text-[12px] font-bold text-[#9A7B56] block">
                  {selectedInquiry.inquiry_number}
                </span>
                <h3 className="font-serif text-[18px] font-semibold text-[#1C1917] mt-0.5">
                  {selectedInquiry.subject || 'Client Inquiry'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-[#78716C] hover:text-[#1C1917] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2] rounded-xl text-[12px]">
                <div>
                  <span className="text-[#78716C] block">Client Name</span>
                  <span className="font-semibold text-[#1C1917]">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[#78716C] block">Phone Number</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="font-semibold text-[#9A7B56]">
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[#78716C] block">Email</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="font-semibold text-[#1C1917] truncate block">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#78716C] block">Date Received</span>
                  <span className="font-medium text-[#1C1917]">
                    {new Date(selectedInquiry.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1.5">
                  Message Content
                </span>
                <div className="p-4 bg-[#FAF7F2] border border-[#EAE4D8] rounded-xl text-[13px] text-[#1C1917] whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1.5">
                  Status
                </span>
                <div className="flex gap-2">
                  {['NEW', 'CONTACTED', 'RESOLVED', 'ARCHIVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedInquiry.id, st)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedInquiry.status === st
                          ? 'bg-[#2C221E] text-white border-[#2C221E]'
                          : 'bg-white text-[#78716C] border-[#EAE4D8] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EAE4D8] flex items-center justify-between">
              <a
                href={`https://wa.me/91${(selectedInquiry.phone || '').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.name}, thank you for contacting Zaira Furnishing regarding "${selectedInquiry.subject}". How can our team assist you today?`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[12px] font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <span>Reply via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 border border-[#EAE4D8] text-[12px] font-medium text-[#1C1917] rounded-xl hover:bg-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
