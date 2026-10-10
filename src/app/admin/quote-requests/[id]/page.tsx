'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  User,
  Package,
  Layers,
  FileText,
} from 'lucide-react';
import { DbQuoteRequest, QuoteRequestStatus } from '@/lib/db/types';

const VALID_STATUSES: QuoteRequestStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'CANCELLED'];

export default function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [quoteRequest, setQuoteRequest] = useState<DbQuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status editing
  const [selectedStatus, setSelectedStatus] = useState<QuoteRequestStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quote-requests/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Quote request not found.');
        throw new Error(`Failed to load quote request (${res.status})`);
      }
      const data = await res.json();
      if (data?.quoteRequest) {
        setQuoteRequest(data.quoteRequest);
        setSelectedStatus(data.quoteRequest.status);
        setAdminNotes(data.quoteRequest.customer_notes || '');
      }
    } catch (err: any) {
      console.error('Error fetching quote request detail:', err);
      setError(err.message || 'Failed to fetch details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch(`/api/quote-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          customerNotes: adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update quote request status');
      }

      setQuoteRequest(data.quoteRequest);
      setSaveSuccess(`Status successfully updated to ${selectedStatus}.`);
    } catch (err: any) {
      console.error('Error updating quote status:', err);
      setSaveError(err.message || 'Error occurred while updating status.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: QuoteRequestStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            NEW
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            CONTACTED
          </span>
        );
      case 'QUOTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF8F3] text-[#7A5832] border border-[#E8DFC8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7B56]" />
            QUOTED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            CLOSED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            CANCELLED
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#9A7B56]" />
        <span className="text-xs text-stone-500">Loading quote request detail...</span>
      </div>
    );
  }

  if (error || !quoteRequest) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Link
          href="/admin/quote-requests"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quote Requests</span>
        </Link>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Quote request not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/quote-requests"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quote Requests</span>
        </Link>
        <div className="flex items-center gap-2">
          {getStatusBadge(quoteRequest.status)}
        </div>
      </div>

      {/* Title Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span className="font-mono font-bold text-[#1C1917] text-base">
              {quoteRequest.request_number}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {new Date(quoteRequest.created_at).toLocaleString('en-IN')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated {new Date(quoteRequest.updated_at).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Details & Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer & Snapshot Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider border-b border-stone-100 pb-3">
              <User className="w-4 h-4 text-[#9A7B56]" />
              <span>Customer Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-stone-900 text-sm">{quoteRequest.customer_name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Phone Number</span>
                <a
                  href={`tel:${quoteRequest.customer_phone}`}
                  className="font-medium text-stone-900 hover:text-[#9A7B56] flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{quoteRequest.customer_phone}</span>
                </a>
              </div>
              {quoteRequest.customer_email && (
                <div>
                  <span className="text-stone-400 block text-[11px]">Email Address</span>
                  <a
                    href={`mailto:${quoteRequest.customer_email}`}
                    className="font-medium text-stone-900 hover:text-[#9A7B56] flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{quoteRequest.customer_email}</span>
                  </a>
                </div>
              )}
              {quoteRequest.user_id && (
                <div>
                  <span className="text-stone-400 block text-[11px]">User Account ID</span>
                  <span className="font-mono text-stone-600 text-[11px]">{quoteRequest.user_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical Product Snapshot */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4 text-[#9A7B56]" />
                <span>Historical Product Snapshot (Immutable)</span>
              </div>
              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                Captured at Submission
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Product Name</span>
                <span className="font-semibold text-stone-900 text-sm">
                  {quoteRequest.product_name_snapshot}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <span className="text-stone-400 block text-[11px]">Category</span>
                  <span className="font-medium text-stone-800">
                    {quoteRequest.category_name_snapshot || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Product SKU</span>
                  <span className="font-mono text-stone-700">
                    {quoteRequest.product_sku_snapshot || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Selected Variant</span>
                  <span className="font-medium text-[#9A7B56]">
                    {quoteRequest.variant_name_snapshot || 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Quantity</span>
                  <span className="font-semibold text-stone-900">{quoteRequest.quantity}</span>
                </div>
              </div>

              {quoteRequest.dimensions && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 block text-[11px]">Dimensions Provided</span>
                  <span className="font-medium text-stone-800">{quoteRequest.dimensions}</span>
                </div>
              )}

              {quoteRequest.customization_details && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 block text-[11px]">Customization Details</span>
                  <span className="font-medium text-stone-800">
                    {quoteRequest.customization_details}
                  </span>
                </div>
              )}

              {quoteRequest.starting_price_snapshot !== null &&
                quoteRequest.starting_price_snapshot !== undefined && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-stone-400 block text-[11px]">Starting Price Snapshot</span>
                    <span className="font-semibold text-stone-900">
                      ₹{quoteRequest.starting_price_snapshot.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Customer Requirements / Notes */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider border-b border-stone-100 pb-3">
              <FileText className="w-4 h-4 text-[#9A7B56]" />
              <span>Customer Requirements & Notes</span>
            </div>
            <div className="text-xs text-stone-700 bg-[#FAF7F2] p-3 rounded-lg border border-stone-200">
              {quoteRequest.customer_notes ? (
                <p className="whitespace-pre-wrap">{quoteRequest.customer_notes}</p>
              ) : (
                <span className="text-stone-400 italic">No additional customer notes provided.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Admin Management */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider border-b border-stone-100 pb-3">
              <Layers className="w-4 h-4 text-[#9A7B56]" />
              <span>Manage Request Status</span>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-[#FBF8F3] border-[#E8DFC8] rounded-lg text-xs text-[#7A5832] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9A7B56]" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Update Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as QuoteRequestStatus)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs outline-none focus:border-[#9A7B56] cursor-pointer"
                >
                  {VALID_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Internal / Customer Notes
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record quotation notes, fabric codes shared, or follow-up status..."
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs outline-none focus:border-[#9A7B56] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-[#1C1714] hover:bg-[#2C221E] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? 'Updating...' : 'Save Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
