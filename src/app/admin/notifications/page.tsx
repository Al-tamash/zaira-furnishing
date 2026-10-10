'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Phone,
  MessageSquare,
  ExternalLink,
  ShoppingBag,
  Ruler,
  FileQuestion,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AdminNotificationItem {
  id: string;
  type: 'ORDER' | 'MEASUREMENT' | 'QUOTE' | 'CONSULTATION';
  reference_id: string;
  reference_number: string;
  title: string;
  message: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  amount?: number | null;
  action_url: string;
  phone_call_url?: string | null;
  whatsapp_url?: string | null;
  is_read: number;
  read_at?: string | null;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ORDER' | 'MEASUREMENT' | 'QUOTE'>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [counts, setCounts] = useState({ total: 0, orders: 0, measurements: 0, quotes: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.set('type', filterType);
      if (unreadOnly) params.set('unread_only', 'true');
      params.set('limit', '50');

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
        setCounts((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        // Broadcast refresh to layout header bell
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setCounts({ total: 0, orders: 0, measurements: 0, quotes: 0 });
        window.dispatchEvent(new CustomEvent('admin-notifications-refresh'));
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (isToday) return `Today, ${time}`;
      return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`;
    } catch {
      return dateStr;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ORDER':
        return {
          icon: ShoppingBag,
          label: 'Customer Order',
          bg: 'bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]',
        };
      case 'MEASUREMENT':
        return {
          icon: Ruler,
          label: 'Measurement Visit',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'CONSULTATION':
        return {
          icon: Sparkles,
          label: 'In-Home Consultation',
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
        };
      case 'QUOTE':
        return {
          icon: FileQuestion,
          label: 'Quote Inquiry',
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
        };
      default:
        return {
          icon: Bell,
          label: 'Alert',
          bg: 'bg-stone-50 text-stone-700 border-stone-200',
        };
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE8DE]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#9A7B56] font-semibold">
            <span>Atelier Real-Time Dispatch</span>
            <span>•</span>
            <span>Mobile Alert Center</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
            Notifications & Client Requests
          </h1>
          <p className="text-sm text-[#78716C] mt-0.5">
            Instant alerts for new customer orders, in-home measurement appointments, and consultation bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchNotifications()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5CDBF] bg-white text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {counts.total > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Mobile Tip Banner ─── */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Phone Quick-Actions:</strong> Tap <strong>Call</strong> to dial a client instantly or <strong>WhatsApp</strong> to send them an appointment confirmation directly from your phone.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold shrink-0 cursor-pointer"
          title="Toggle audio alert chime"
        >
          {audioEnabled ? <Volume2 className="w-3 h-3 text-amber-700" /> : <VolumeX className="w-3 h-3 text-stone-500" />}
          <span>{audioEnabled ? 'Chime ON' : 'Chime Muted'}</span>
        </button>
      </div>

      {/* ─── Filter Tabs & Pills ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#EDE8DE]">
          {[
            { key: 'ALL', label: 'All Alerts', count: counts.total },
            { key: 'ORDER', label: 'Orders', count: counts.orders },
            { key: 'MEASUREMENT', label: 'Measurements & Visits', count: counts.measurements },
            { key: 'QUOTE', label: 'Quotes', count: counts.quotes },
          ].map((tab) => {
            const isSelected = filterType === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-[#1C1917] shadow-2xs font-bold border border-[#EDE8DE]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-[#9A7B56] text-white' : 'bg-[#EAE4D8] text-[#57534E]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-medium text-[#57534E] cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[#D5CDBF] text-[#2C221E] focus:ring-[#2C221E]"
          />
          <span>Unread alerts only</span>
        </label>
      </div>

      {/* ─── Notification Feed ─── */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#EDE8DE]">
          <div className="w-8 h-8 border-2 border-[#9A7B56] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider text-[#A8A29E]">Loading notification feed...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#EDE8DE] p-6">
          <Bell className="w-10 h-10 text-[#C4B9A1] mx-auto opacity-60" />
          <h3 className="font-serif text-lg font-semibold text-[#1C1917]">No Notifications Found</h3>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            {unreadOnly
              ? 'You have caught up with all active client alerts.'
              : 'New orders and measurement requests will appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const badge = getTypeBadge(item.type);
            const BadgeIcon = badge.icon;
            const isUnread = item.is_read === 0 || !item.is_read;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isUnread
                    ? 'bg-white border-[#2C221E]/30 shadow-xs ring-1 ring-[#2C221E]/10'
                    : 'bg-[#FAF9F6] border-[#EDE8DE] opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Badge, Title & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      <span className="font-mono text-xs font-bold text-[#1C1917]">
                        #{item.reference_number}
                      </span>

                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full bg-[#9A7B56] text-white text-[10px] font-bold">
                          NEW
                        </span>
                      )}

                      <span className="text-[11px] text-[#8C827A] ml-auto sm:ml-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.created_at)}</span>
                      </span>
                    </div>

                    <h3 className="font-semibold text-[15px] text-[#1C1917] leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {item.message}
                    </p>

                    {/* Customer Info Row */}
                    <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C]">
                      <span>
                        Client: <strong className="text-[#1C1917]">{item.customer_name}</strong>
                      </span>
                      {item.customer_phone && (
                        <span>
                          Phone: <strong className="text-[#2C221E] font-mono">{item.customer_phone}</strong>
                        </span>
                      )}
                      {item.amount && item.amount > 0 && (
                        <span>
                          Total: <strong className="text-[#2C221E] font-bold">₹{Number(item.amount).toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons (Optimized for Mobile Phone Dialing & WhatsApp) */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 shrink-0">
                    {/* Call Button */}
                    {item.phone_call_url && (
                      <a
                        href={item.phone_call_url}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-[#1C1714] text-white text-xs font-semibold shadow-2xs transition-colors"
                        title={`Call ${item.customer_name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Call</span>
                      </a>
                    )}

                    {/* WhatsApp Button */}
                    {item.whatsapp_url && (
                      <a
                        href={item.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-semibold shadow-2xs transition-colors"
                        title={`Chat with ${item.customer_name} on WhatsApp`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* View Details Link */}
                    <Link
                      href={item.action_url}
                      onClick={() => handleMarkAsRead(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D5CDBF] bg-white text-[#1C1917] hover:border-[#1C1917] text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 text-[#9A7B56]" />
                    </Link>

                    {/* Mark Read */}
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#1C1917] hover:bg-[#EAE4D8] transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
