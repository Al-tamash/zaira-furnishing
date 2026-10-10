'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { BookingModal } from '@/components/forms/BookingModal';
import { ShowroomVisitModal } from '@/components/common/ShowroomVisitModal';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  sizeLabel?: string;
  headingStyle?: string;
  customDimensions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizationData?: Record<string, any>;
  productType?: string;
  isAvailable?: boolean;
}

export interface CustomerUser {
  id: string;
  role: 'CUSTOMER';
  name: string;
  email: string;
  phone?: string | null;
}

export interface Order {
  id: string; // e.g. "ZF-842915" or "ZAI-2026-000001"
  rawStatus?: string; // Canonical D1 status: 'CONFIRMED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'PENDING'
  orderSource?: string; // 'WHATSAPP' | 'WEB' | 'QUOTE' | 'MEASUREMENT'
  landmark?: string | null;
  paymentStatus?: string;
  statusHistory?: Array<{ status: string; timestamp: string }>;
  createdAt: string; // ISO date string
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  deliveryAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  deliveryOption: 'standard' | 'service_visit';
  timeSlot?: 'morning' | 'afternoon' | 'evening';
  paymentMethod: 'cod' | 'online_demo';
  status:
    | 'order_received'
    | 'details_confirmed'
    | 'tailoring_preparation'
    | 'ready_for_dispatch'
    | 'delivered_installed'
    | 'cancelled';
  hasCustomProducts: boolean;
}

interface StoreContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => Promise<void> | void;
  removeFromCart: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, delta: number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  wishlist: Record<string, boolean>;
  wishlistCount: number;
  toggleWishlist: (productId: string) => Promise<void> | void;
  isWishlisted: (productId: string) => boolean;
  orders: Order[];
  saveOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  // Stage 3 Customer Authentication Additions
  customer: CustomerUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  // Booking Modal State
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  bookingService: string;
  setBookingService: (service: string) => void;
  openBookingModal: (service?: string) => void;
  // Showroom Visit Modal State
  isStoreModalOpen: boolean;
  setIsStoreModalOpen: (open: boolean) => void;
  openStoreModal: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState('Free In-Home Measurement');

  const openBookingModal = useCallback((service?: string) => {
    if (service) {
      setBookingService(service);
    }
    setIsBookingModalOpen(true);
  }, []);

  // Showroom Visit Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const openStoreModal = useCallback(() => {
    setIsStoreModalOpen(true);
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // ─── 1. Fetch Remote Database Cart for Authenticated Customer ───
  const fetchRemoteCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching remote cart:', err);
    }
  }, []);

  // ─── 2. Fetch Remote Database Wishlist for Authenticated Customer ───
  const fetchRemoteWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, boolean> = {};
        for (const id of data.ids || []) {
          map[id] = true;
        }
        setWishlist(map);
      }
    } catch (err) {
      console.error('Error fetching remote wishlist:', err);
    }
  }, []);

  // ─── 3. Synchronize Local Guest Cart into Database on Login ───
  const syncLocalCartToDatabase = useCallback(async () => {
    try {
      const savedCart = localStorage.getItem('zaira_cart');
      if (savedCart) {
        const localItems: CartItem[] = JSON.parse(savedCart);
        if (Array.isArray(localItems) && localItems.length > 0) {
          for (const item of localItems) {
            await fetch('/api/cart/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                sizeLabel: item.sizeLabel,
                headingStyle: item.headingStyle,
                customDimensions: item.customDimensions,
                customizationData: item.customizationData,
              }),
            });
          }
          localStorage.removeItem('zaira_cart');
        }
      }
    } catch (err) {
      console.error('Error syncing local cart to database:', err);
    }
  }, []);

  // ─── 3b. Fetch Remote Orders for Authenticated Customer ───
  const fetchRemoteOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        const mappedOrders: Order[] = (data.orders || []).map((o: any) => {
          const items: CartItem[] = (o.items || []).map((it: any) => {
            let customData: any = undefined;
            if (it.customization_data) {
              try {
                customData = typeof it.customization_data === 'string' ? JSON.parse(it.customization_data) : it.customization_data;
              } catch {
                customData = undefined;
              }
            }
            return {
              id: it.id,
              productId: it.product_id,
              name: it.product_name_snapshot,
              slug: it.product_slug || '',
              image: it.product_image || '/images/products/curtains/blackout-curtains/main.jpg',
              variantName: it.variant_name_snapshot || undefined,
              sku: it.product_id,
              quantity: it.quantity,
              unitPrice: it.unit_price_snapshot,
              totalPrice: it.line_total,
              customizationData: customData,
              customDimensions: customData?.customDimensions,
              sizeLabel: customData?.sizeLabel,
              headingStyle: customData?.headingStyle,
            };
          });

          return {
            id: o.order_number, // User-facing human-readable reference, e.g. "ZAI-2026-000001"
            rawStatus: (o.status || 'CONFIRMED').toUpperCase(),
            orderSource: o.order_source || 'WEB',
            landmark: o.landmark || null,
            paymentStatus: o.payment_status || 'PENDING',
            createdAt: o.created_at,
            items,
            subtotal: o.subtotal,
            shippingCost: o.delivery_charge || 0,
            total: o.total_amount,
            customer: {
              fullName: o.customer_name,
              phone: o.customer_phone,
              email: o.customer_email,
            },
            deliveryAddress: {
              addressLine1: o.delivery_address,
              addressLine2: '',
              city: o.city,
              state: o.state,
              pincode: o.pincode,
              country: 'India',
            },
            deliveryOption: (o.delivery_option as any) || 'standard',
            timeSlot: o.site_visit_time || undefined,
            paymentMethod: o.payment_method === 'COD' ? 'cod' : 'online_demo',
            status: (() => {
              const s = (o.status || '').toUpperCase();
              if (s === 'PENDING') return 'order_received';
              if (s === 'CONFIRMED') return 'details_confirmed';
              if (s === 'PROCESSING') return 'tailoring_preparation';
              if (s === 'READY') return 'ready_for_dispatch';
              if (s === 'COMPLETED') return 'delivered_installed';
              if (s === 'CANCELLED') return 'cancelled';
              return 'details_confirmed';
            })(),
            hasCustomProducts: items.some(
              (it) => it.customDimensions || it.customizationData
            ),
          };
        });
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Error fetching remote orders:', err);
    }
  }, []);

  // ─── 4. Check & Refresh Customer Session from Server ───
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setCustomer(data.user);
        // Sync any local cart into database then load remote cart, wishlist & orders
        await syncLocalCartToDatabase();
        await Promise.all([fetchRemoteCart(), fetchRemoteWishlist(), fetchRemoteOrders()]);
      } else {
        setCustomer(null);
      }
    } catch (err) {
      console.error('Error verifying customer session:', err);
      setCustomer(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, [syncLocalCartToDatabase, fetchRemoteCart, fetchRemoteWishlist, fetchRemoteOrders]);

  // Initial load
  useEffect(() => {
    // 1. Load initial local storage data for guest state
    try {
      const savedCart = localStorage.getItem('zaira_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('zaira_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      const savedOrders = localStorage.getItem('zaira_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch {
      // LocalStorage unavailable
    }
    setIsHydrated(true);

    // 2. Check server-side session
    refreshSession();
  }, [refreshSession]);

  // Persist guest cart to localStorage when unauthenticated
  useEffect(() => {
    if (!isHydrated) return;
    if (customer) return; // Do not save authenticated database cart to guest local storage
    try {
      localStorage.setItem('zaira_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart, isHydrated, customer]);

  // Persist guest wishlist to localStorage when unauthenticated
  useEffect(() => {
    if (!isHydrated) return;
    if (customer) return;
    try {
      localStorage.setItem('zaira_wishlist', JSON.stringify(wishlist));
    } catch {
      // Ignore storage errors
    }
  }, [wishlist, isHydrated, customer]);

  // Save demo orders
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('zaira_orders', JSON.stringify(orders));
    } catch {
      // Ignore storage errors
    }
  }, [orders, isHydrated]);

  // ─── ADD TO CART ───
  const addToCart = async (item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    if (customer) {
      // Database-backed cart addition with server-side pricing
      try {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            sizeLabel: item.sizeLabel,
            headingStyle: item.headingStyle,
            customDimensions: item.customDimensions,
            customizationData: item.customizationData,
          }),
        });

        if (res.ok) {
          await fetchRemoteCart();
          setIsCartOpen(true);
          return;
        }
      } catch (err) {
        console.error('Database cart add failed:', err);
      }
    }

    // Guest Fallback
    const id = `${item.productId}-${item.variantName || 'default'}-${item.sizeLabel || 'std'}-${item.headingStyle || 'default'}`;
    const totalPrice = item.unitPrice * item.quantity;

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + item.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: updated[existingIdx].unitPrice * newQty,
        };
        return updated;
      }
      return [{ ...item, id, totalPrice }, ...prev];
    });

    setIsCartOpen(true);
  };

  // ─── REMOVE FROM CART ───
  const removeFromCart = async (id: string) => {
    if (customer) {
      try {
        const res = await fetch(`/api/cart/items/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchRemoteCart();
          return;
        }
      } catch (err) {
        console.error('Database cart remove failed:', err);
      }
    }

    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ─── UPDATE QUANTITY ───
  const updateQuantity = async (id: string, delta: number) => {
    if (customer) {
      try {
        const res = await fetch(`/api/cart/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta }),
        });
        if (res.ok) {
          await fetchRemoteCart();
          return;
        }
      } catch (err) {
        console.error('Database cart quantity update failed:', err);
      }
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // ─── CLEAR CART ───
  const clearCart = async () => {
    if (customer) {
      try {
        await fetch('/api/cart', { method: 'DELETE' });
      } catch (err) {
        console.error('Database cart clear failed:', err);
      }
    }
    setCart([]);
  };

  // ─── TOGGLE WISHLIST ───
  const toggleWishlist = async (productId: string) => {
    if (!customer) {
      // Guest: Prompt to sign in to sync wishlist to database
      setAuthModalOpen(true);
      return;
    }

    const currentlyFav = !!wishlist[productId];
    try {
      if (currentlyFav) {
        await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      }
      await fetchRemoteWishlist();
    } catch (err) {
      console.error('Database wishlist toggle error:', err);
    }
  };

  const isWishlisted = (productId: string) => !!wishlist[productId];

  // ─── LOGOUT ───
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCustomer(null);
    // Clear in-memory cart, wishlist, and orders so previous customer's data is never displayed to guest
    setCart([]);
    setWishlist({});
    setOrders([]);
    try {
      localStorage.removeItem('zaira_cart');
      localStorage.removeItem('zaira_wishlist');
      localStorage.removeItem('zaira_orders');
    } catch {
      // ignore
    }
  };

  const saveOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
  };

  const getOrderById = (id: string) => {
    return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const wishlistCount = Object.keys(wishlist).length;

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        wishlistCount,
        toggleWishlist,
        isWishlisted,
        orders,
        saveOrder,
        getOrderById,
        refreshOrders: fetchRemoteOrders,
        customer,
        isAuthenticated: !!customer,
        isAuthLoading,
        refreshSession,
        logout,
        authModalOpen,
        setAuthModalOpen,
        isBookingModalOpen,
        setIsBookingModalOpen,
        bookingService,
        setBookingService,
        openBookingModal,
        isStoreModalOpen,
        setIsStoreModalOpen,
        openStoreModal,
      }}
    >
      {children}
      <AuthModal />
      <BookingModal />
      <ShowroomVisitModal />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
