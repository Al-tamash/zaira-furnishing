/**
 * TypeScript Data Models for Zaira Furnishing Database Layer (Cloudflare D1 / SQLite)
 */

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'VENDOR';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface DbUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string | null;
  password_hash?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  image: string;
  display_order: number;
  active: number; // 1 | 0
  featured: number; // 1 | 0
  is_customizable: number; // 1 | 0
  item_count_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  display_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export type DbProductType = 'standard' | 'custom_made';
export type DbPricingType =
  | 'fixed'
  | 'per_metre'
  | 'per_panel'
  | 'per_roll'
  | 'per_sqft'
  | 'custom_estimate';

export interface DbProduct {
  id: string;
  category_id: string;
  subcategory_id?: string | null;
  name: string;
  display_name?: string | null;
  slug: string;
  description: string;
  short_description: string;
  product_type: DbProductType;
  pricing_type: DbPricingType;
  base_price: number;
  starting_price: number; // 1 | 0
  unit?: string | null;
  custom_made: number;
  featured: number;
  custom_measurement_available: number;
  active: number;
  display_order: number;
  currency: string;
  space_slugs?: string | null; // JSON string array
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order: number;
  is_main: number; // 1 | 0
  active: number;
  created_at: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  name: string;
  variant_type: string;
  sku: string;
  color_hex?: string | null;
  thumbnail_image?: string | null;
  preview_image?: string | null;
  price_adjustment?: number | null;
  in_stock: number;
  attributes?: string | null; // JSON string object
  display_order: number;
  active: number;
  created_at: string;
}

export interface DbProductSpecification {
  id: string;
  product_id: string;
  label: string;
  value: string;
  display_order: number;
}

export interface DbCustomizationConfig {
  id: string;
  product_id: string;
  field_key: string;
  field_label: string;
  field_type: 'dimension_pair' | 'select' | 'number' | 'text' | 'boolean';
  options?: string | null; // JSON string array
  default_value?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  unit?: string | null;
  is_required: number;
  display_order: number;
}

export interface DbService {
  id: string;
  name: string;
  slug: string;
  short_desc: string;
  full_desc?: string | null;
  image: string;
  icon_name: string;
  highlights?: string | null; // JSON string array
  requires_site_visit: number;
  active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbCmsContent {
  id: string;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  content?: string | null; // JSON string payload
  image_url?: string | null;
  secondary_image_url?: string | null;
  updated_by?: string | null;
  updated_at: string;
}

export type OrderSource = 'WEB' | 'WHATSAPP' | 'QUOTE' | 'MEASUREMENT';

export interface DbOrder {
  id: string;
  order_number: string;
  user_id: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';
  payment_method: 'COD';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  delivery_option: 'standard' | 'service_visit' | string;
  site_visit_required: number;
  site_visit_date?: string | null;
  site_visit_time?: string | null;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total_amount: number;
  notes?: string | null;
  idempotency_key?: string | null;
  order_source: OrderSource;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name_snapshot: string;
  variant_name_snapshot?: string | null;
  quantity: number;
  unit_price_snapshot: number;
  line_total: number;
  customization_data?: string | null; // JSON string
  product_type: string;
  created_at: string;
}

export interface DbCustomerSession {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface DbWishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface DbCart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price_snapshot: number;
  customization_data?: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export type NotificationEventType =
  | 'NEW_ORDER_CUSTOMER'
  | 'NEW_ORDER_ADMIN'
  | 'ORDER_STATUS_UPDATED_CUSTOMER';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
export type NotificationRecipientType = 'CUSTOMER' | 'ADMIN';

export interface DbOrderNotification {
  id: string;
  order_id: string;
  customer_id?: string | null;
  recipient_type: NotificationRecipientType;
  event_type: NotificationEventType;
  recipient_email: string;
  subject: string;
  status: NotificationStatus;
  provider: string;
  provider_message_id?: string | null;
  error_message?: string | null;
  payload_summary?: string | null; // JSON string summary
  idempotency_key: string;
  attempts: number;
  is_read: number; // 1 | 0
  read_at?: string | null;
  created_at: string;
  sent_at?: string | null;
  updated_at: string;
}

export interface DbOrderStatusHistory {
  id: string;
  order_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  created_at: string;
}

export type AdminNotificationType = 'ORDER' | 'MEASUREMENT' | 'QUOTE' | 'CONSULTATION';

export interface DbAdminNotification {
  id: string;
  type: AdminNotificationType;
  reference_id: string;
  reference_number: string;
  title: string;
  message: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  amount?: number | null;
  action_url: string;
  is_read: number;
  read_at?: string | null;
  created_at: string;
}

// ─── STAGE 3: QUOTE REQUESTS & FREE MEASUREMENT REQUESTS ───

export type QuoteRequestStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CLOSED' | 'CANCELLED';

export interface DbQuoteRequest {
  id: string;
  request_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  product_id: string;
  product_name_snapshot: string;
  product_sku_snapshot?: string | null;
  category_name_snapshot?: string | null;
  category_slug_snapshot?: string | null;
  variant_id?: string | null;
  variant_name_snapshot?: string | null;
  quantity: number;
  dimensions?: string | null;
  customization_details?: string | null; // JSON string
  customer_notes?: string | null;
  starting_price_snapshot?: number | null;
  status: QuoteRequestStatus;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export type MeasurementRequestStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface DbMeasurementRequest {
  id: string;
  request_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  product_id: string;
  product_name_snapshot: string;
  product_sku_snapshot?: string | null;
  category_name_snapshot?: string | null;
  category_slug_snapshot?: string | null;
  variant_id?: string | null;
  variant_name_snapshot?: string | null;
  address: string;
  preferred_date: string;
  preferred_time_slot: string;
  dimensions?: string | null;
  customer_notes?: string | null;
  status: MeasurementRequestStatus;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── PRODUCT CUSTOMER REVIEWS ───

export type ProductReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DbProductReview {
  id: string;
  product_id: string;
  user_id?: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: number; // 1 | 0
  status: ProductReviewStatus;
  created_at: string;
  updated_at: string;
}

// ─── CONTACT INQUIRIES ───

export type ContactInquiryStatus = 'NEW' | 'READ' | 'CONTACTED' | 'RESOLVED' | 'ARCHIVED';

export interface DbContactInquiry {
  id: string;
  inquiry_number: string;
  name: string;
  phone: string;
  email: string;
  subject?: string | null;
  message: string;
  status: ContactInquiryStatus;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}



