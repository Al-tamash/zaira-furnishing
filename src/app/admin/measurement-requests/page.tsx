'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Ruler,
  Search,
  Calendar,
  Phone,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { DbMeasurementRequest, MeasurementRequestStatus } from '@/lib/db/types';

interface MeasurementCounts {
  all: number;
  new: number;
  contacted: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export default function AdminMeasurementRequestsPage() {
  const [requests, setRequests] = useState<DbMeasurementRequest[]>([]);
  const [counts, setCounts] = useState<MeasurementCounts>({
    all: 0,
    new: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await fetch(`/api/measurement-requests?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load measurement requests (${res.status})`);
      }
      const data = await res.json();
      setRequests(data.measurementRequests || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err: any) {
      console.error('Error fetching admin measurement requests:', err);
      setError(err.message || 'Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const getStatusBadge = (status: MeasurementRequestStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            NEW
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            CONTACTED
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Calendar className="w-3 h-3 text-purple-600" />
            SCHEDULED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FBF8F3] text-[#7A5832] border border-[#E8DFC8]">
            <CheckCircle2 className="w-3 h-3 text-[#9A7B56]" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Page Title Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Atelier In-Home Laser Measurement
          </span>
          <h1 className="font-serif text-[24px] sm:text-[30px] text-[#1C1917] font-medium tracking-tight">
            Measurement Requests
          </h1>
          <p className="text-[13px] sm:text-[13.5px] text-[#78716C] mt-1">
            Complimentary in-home laser measurement visits booked by customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchRequests()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D5CDBF] bg-white text-[#1C1917] text-[12.5px] font-medium hover:border-[#1C1917] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Status Filter Tabs ─── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12.5px]">
          {[
            { key: 'ALL', label: 'All', count: counts.all },
            { key: 'NEW', label: 'New', count: counts.new },
            { key: 'CONTACTED', label: 'Contacted', count: counts.contacted },
            { key: 'SCHEDULED', label: 'Scheduled', count: counts.scheduled },
            { key: 'COMPLETED', label: 'Completed', count: counts.completed },
            { key: 'CANCELLED', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                statusFilter === tab.key
                  ? 'bg-[#2C221E] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#57534E] border border-[#EDE8DE] hover:border-[#D5CDBF] hover:bg-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EDE8DE] text-[#78716C]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request number, customer name, phone, email, or product..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#9A7B56] focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-[11px] text-[#8C827A] hover:text-[#1C1917]"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[12.5px] text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#EDE8DE] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1C1917]">
            <thead className="bg-[#FAF7F2] border-b border-[#EDE8DE] text-[#8C827A] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">Request #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Preferred Date</th>
                <th className="py-3.5 px-4">Time Slot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1] font-normal">
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#78716C]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#9A7B56]" />
                    <span>Loading measurement requests from Cloudflare D1...</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#78716C]">
                    <Ruler className="w-8 h-8 mx-auto mb-2 text-[#A8A29E]" />
                    <p className="font-semibold text-[#1C1917]">No measurement requests found</p>
                    <p className="text-[11.5px] text-[#78716C] mt-0.5">
                      Customer bookings for free measurement visits will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono text-[13.5px] font-bold text-[#1C1917] whitespace-nowrap">
                      {req.request_number}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#1C1917]">{req.customer_name}</div>
                      {req.address && (
                        <div className="text-[11.5px] text-[#78716C] truncate max-w-[180px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                          <span>{req.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#1C1917] font-sans text-[12.5px]">
                        <Phone className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>{req.customer_phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1C1917] truncate max-w-[180px]">
                        {req.product_name_snapshot}
                      </div>
                      {req.variant_name_snapshot && (
                        <div className="text-[11.5px] text-[#9A7B56]">
                          Variant: {req.variant_name_snapshot}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-[#1C1917] font-medium">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Calendar className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>
                          {req.preferred_date ? (
                            new Date(req.preferred_date).toString() !== 'Invalid Date' ? (
                              new Date(req.preferred_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            ) : (
                              req.preferred_date
                            )
                          ) : (
                            'Flexible'
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-[#78716C]">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                        <span>{req.preferred_time_slot || 'Morning'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Link
                        href={`/admin/measurement-requests/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5CDBF] hover:bg-[#1C1714] hover:border-[#2C221E] text-[#1C1917] hover:text-white text-[11.5px] font-semibold transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-stone-200 bg-[#FAF7F2] flex items-center justify-between text-xs text-stone-600">
            <div>
              Showing page <span className="font-semibold">{page}</span> of{' '}
              <span className="font-semibold">{totalPages}</span> ({totalCount} total)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
