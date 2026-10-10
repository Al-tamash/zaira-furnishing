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
  MapPin,
  FileText,
} from 'lucide-react';
import { DbMeasurementRequest, MeasurementRequestStatus } from '@/lib/db/types';

const VALID_STATUSES: MeasurementRequestStatus[] = [
  'NEW',
  'CONTACTED',
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
];

export default function AdminMeasurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [measurementRequest, setMeasurementRequest] = useState<DbMeasurementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status editing
  const [selectedStatus, setSelectedStatus] = useState<MeasurementRequestStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/measurement-requests/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Measurement request not found.');
        throw new Error(`Failed to load measurement request (${res.status})`);
      }
      const data = await res.json();
      if (data?.measurementRequest) {
        setMeasurementRequest(data.measurementRequest);
        setSelectedStatus(data.measurementRequest.status);
        setAdminNotes(data.measurementRequest.customer_notes || '');
      }
    } catch (err: any) {
      console.error('Error fetching measurement request detail:', err);
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
      const res = await fetch(`/api/measurement-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          customerNotes: adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update measurement request status');
      }

      setMeasurementRequest(data.measurementRequest);
      setSaveSuccess(`Status successfully updated to ${selectedStatus}.`);
    } catch (err: any) {
      console.error('Error updating measurement status:', err);
      setSaveError(err.message || 'Error occurred while updating status.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: MeasurementRequestStatus) => {
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
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            SCHEDULED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF8F3] text-[#7A5832] border border-[#E8DFC8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#9A7B56]" />
            COMPLETED
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
        <span className="text-xs text-stone-500">Loading measurement request detail...</span>
      </div>
    );
  }

  if (error || !measurementRequest) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <Link
          href="/admin/measurement-requests"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Measurement Requests</span>
        </Link>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Measurement request not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/measurement-requests"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Measurement Requests</span>
        </Link>
        <div className="flex items-center gap-2">
          {getStatusBadge(measurementRequest.status)}
        </div>
      </div>

      {/* Title Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span className="font-mono font-bold text-[#1C1917] text-base">
              {measurementRequest.request_number}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {new Date(measurementRequest.created_at).toLocaleString('en-IN')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated {new Date(measurementRequest.updated_at).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Details & Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer, Location, Product Snapshot, Appointment */}
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
                <span className="font-semibold text-stone-900 text-sm">
                  {measurementRequest.customer_name}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Phone Number</span>
                <a
                  href={`tel:${measurementRequest.customer_phone}`}
                  className="font-medium text-stone-900 hover:text-[#9A7B56] flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{measurementRequest.customer_phone}</span>
                </a>
              </div>
              {measurementRequest.customer_email && (
                <div>
                  <span className="text-stone-400 block text-[11px]">Email Address</span>
                  <a
                    href={`mailto:${measurementRequest.customer_email}`}
                    className="font-medium text-stone-900 hover:text-[#9A7B56] flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{measurementRequest.customer_email}</span>
                  </a>
                </div>
              )}
              {measurementRequest.user_id && (
                <div>
                  <span className="text-stone-400 block text-[11px]">User Account ID</span>
                  <span className="font-mono text-stone-600 text-[11px]">
                    {measurementRequest.user_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Appointment Details */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider border-b border-stone-100 pb-3">
              <MapPin className="w-4 h-4 text-[#9A7B56]" />
              <span>Visit Location & Appointment Request</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Address / Location</span>
                <p className="font-medium text-stone-900 text-sm mt-0.5">
                  {measurementRequest.address}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <span className="text-stone-400 block text-[11px]">Preferred Visit Date</span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-stone-900">
                    <Calendar className="w-4 h-4 text-[#9A7B56]" />
                    <span>{measurementRequest.preferred_date}</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Preferred Time Window</span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-medium text-stone-800">
                    <Clock className="w-4 h-4 text-[#9A7B56]" />
                    <span>{measurementRequest.preferred_time_slot}</span>
                  </div>
                </div>
              </div>

              {measurementRequest.dimensions && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 block text-[11px]">Preliminary Dimensions</span>
                  <span className="font-medium text-stone-800">
                    {measurementRequest.dimensions}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Historical Product Snapshot */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4 text-[#9A7B56]" />
                <span>Product Snapshot (Immutable)</span>
              </div>
              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                Captured at Submission
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Product Name</span>
                <span className="font-semibold text-stone-900 text-sm">
                  {measurementRequest.product_name_snapshot}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <span className="text-stone-400 block text-[11px]">Category</span>
                  <span className="font-medium text-stone-800">
                    {measurementRequest.category_name_snapshot || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Product SKU</span>
                  <span className="font-mono text-stone-700">
                    {measurementRequest.product_sku_snapshot || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Selected Variant</span>
                  <span className="font-medium text-[#9A7B56]">
                    {measurementRequest.variant_name_snapshot || 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-stone-700 font-semibold text-xs uppercase tracking-wider border-b border-stone-100 pb-3">
              <FileText className="w-4 h-4 text-[#9A7B56]" />
              <span>Customer Notes & Instructions</span>
            </div>
            <div className="text-xs text-stone-700 bg-[#FAF7F2] p-3 rounded-lg border border-stone-200">
              {measurementRequest.customer_notes ? (
                <p className="whitespace-pre-wrap">{measurementRequest.customer_notes}</p>
              ) : (
                <span className="text-stone-400 italic">No notes supplied by customer.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Visit Management */}
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
                  onChange={(e) => setSelectedStatus(e.target.value as MeasurementRequestStatus)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs outline-none focus:border-[#9A7B56] cursor-pointer"
                >
                  {VALID_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Initial status is NEW. Mark SCHEDULED only once concierge confirms date and tailor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Internal Visit Notes / Customer Notes
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record assigned tailor, visit confirmation status, or customer instructions..."
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
