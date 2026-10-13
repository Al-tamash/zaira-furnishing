/**
 * Zaira Furnishing — Centralized WhatsApp Utilities & Message Builder
 *
 * Official WhatsApp Line: +91 63001 45763
 */

export const ZAIRA_WHATSAPP_NUMBER = '916300145763';
export const ZAIRA_WHATSAPP_DISPLAY = '+91 63001 45763';
export const ZAIRA_WHATSAPP_URL = 'https://wa.me/916300145763';
export const ZAIRA_SHOWROOM_ADDRESS = 'Shop No. 5, Rd Number 5, Kyettaian Gouda Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089';
export const ZAIRA_SHOWROOM_TIMINGS = '10:30 AM – 8:30 PM (Mon–Sat · Sun by Appointment)';
export const ZAIRA_SHOWROOM_PHONE = '+91 63001 45763';
export const ZAIRA_SHOWROOM_MAPS_URL = 'https://maps.google.com/?q=Zaira+Furnishing+Alkapur+Township+Puppalguda+Hyderabad';
export const ZAIRA_SHOWROOM_360_TOUR_EMBED_URL = 'https://www.google.com/maps/embed?pb=!4v1791894683148!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRFIydDI2aEFF!2m2!1d17.39544123570332!2d78.37321712841006!3f184.77997255554175!4f11.232270408289608!5f0.7820865974627469';
export const ZAIRA_EMAIL = 'zairafurnishing@gmail.com';

export interface WhatsAppOrderItem {
  productId?: string;
  product_id?: string;
  productName?: string;
  product_name_snapshot?: string;
  name?: string;
  variantId?: string | null;
  variant_id?: string | null;
  variantName?: string | null;
  variant_name_snapshot?: string | null;
  quantity: number;
  unitPrice?: number;
  unit_price_snapshot?: number;
  price?: number;
  lineTotal?: number;
  line_total?: number;
  customizationData?: string | null | Record<string, unknown>;
  customization_data?: string | null;
  productType?: string;
  product_type?: string;
}

export interface WhatsAppOrderData {
  id?: string;
  orderNumber?: string;
  order_number?: string;
  customerName?: string;
  customer_name?: string;
  customerPhone?: string;
  customer_phone?: string;
  customerEmail?: string;
  customer_email?: string;
  deliveryAddress?: string;
  delivery_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string | null;
  deliveryOption?: string;
  delivery_option?: string;
  siteVisitTime?: string | null;
  site_visit_time?: string | null;
  siteVisitRequired?: number;
  site_visit_required?: number;
  paymentMethod?: string;
  payment_method?: string;
  paymentStatus?: string;
  payment_status?: string;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  delivery_charge?: number;
  totalAmount?: number;
  total_amount?: number;
  notes?: string | null;
  orderSource?: string;
  order_source?: string;
  items?: WhatsAppOrderItem[];
}

/**
 * Helper to safely parse customization payload from string or object
 */
function parseCustomization(data: unknown): Record<string, any> | null {
  if (!data) return null;
  if (typeof data === 'object') return data as Record<string, any>;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return { raw: data };
    }
  }
  return null;
}

/**
 * Standardized WhatsApp Message Builder for Customer Order Confirmation
 */
export function buildOrderWhatsAppMessage(order: WhatsAppOrderData): string {
  const orderRef = order.orderNumber || order.order_number || order.id || 'N/A';
  const customerName = order.customerName || order.customer_name || 'Valued Customer';
  const customerPhone = order.customerPhone || order.customer_phone || '';

  const subtotal = order.subtotal ?? 0;
  const discount = order.discount ?? 0;
  const deliveryCharge = order.deliveryCharge ?? order.delivery_charge ?? 0;
  const totalAmount = order.totalAmount ?? order.total_amount ?? subtotal + deliveryCharge - discount;

  const deliveryOption = order.deliveryOption || order.delivery_option || 'standard';
  const siteVisitTime = order.siteVisitTime || order.site_visit_time;
  const deliveryOptionLabel =
    deliveryOption === 'service_visit'
      ? `Service Visit / In-Home Consultation${siteVisitTime ? ` (${siteVisitTime})` : ''}`
      : 'Standard Delivery';

  const address = order.deliveryAddress || order.delivery_address || '';
  const city = order.city || '';
  const state = order.state || '';
  const pincode = order.pincode || '';
  const landmark = order.landmark;

  const paymentMethod =
    (order.paymentMethod || order.payment_method || 'COD').toUpperCase() === 'COD'
      ? 'Cash on Delivery'
      : (order.paymentMethod || order.payment_method || 'Cash on Delivery');
  const paymentStatus = order.paymentStatus || order.payment_status || 'Pending';

  const items = order.items || [];

  const messageSections: string[] = [];

  // Header & Order Reference
  messageSections.push('*ZAIRA FURNISHING — ORDER REQUEST*');
  messageSections.push(`Order ID: ${orderRef}`);

  // Customer Details
  const customerLines = ['*Customer Details*', `Name: ${customerName}`];
  if (customerPhone) {
    const formattedPhone = customerPhone.startsWith('+')
      ? customerPhone
      : customerPhone.length === 10
      ? `+91 ${customerPhone}`
      : customerPhone;
    customerLines.push(`Phone: ${formattedPhone}`);
  }
  messageSections.push(customerLines.join('\n'));

  // Order Details / Line Items
  const itemsLines = ['*Order Details*'];
  if (items.length === 0) {
    itemsLines.push('1. Bespoke Furnishing Order');
  } else {
    items.forEach((item, index) => {
      const num = index + 1;
      const title =
        item.product_name_snapshot || item.productName || item.name || 'Furnishing Item';
      const variant = item.variant_name_snapshot || item.variantName;
      const custom = parseCustomization(item.customization_data || item.customizationData);

      const qty = item.quantity || 1;
      const unitPrice =
        item.unit_price_snapshot ??
        item.unitPrice ??
        item.price ??
        (item.line_total ? Math.round(item.line_total / qty) : 0);
      const lineTotal = item.line_total ?? item.lineTotal ?? unitPrice * qty;

      const itemBlock: string[] = [`${num}. ${title}`];

      // Colour / Option
      if (variant) {
        itemBlock.push(`   Colour: ${variant}`);
      }

      // Customization fields (only non-empty, applicable ones)
      if (custom) {
        if ((custom.color || custom.colour) && custom.color !== variant && custom.colour !== variant) {
          itemBlock.push(`   Colour: ${custom.color || custom.colour}`);
        }
        if (custom.fabric) {
          itemBlock.push(`   Fabric: ${custom.fabric}`);
        }
        if (custom.headingStyle) {
          itemBlock.push(`   Heading Style: ${custom.headingStyle}`);
        }
        if (custom.sizeLabel && !custom.customDimensions) {
          itemBlock.push(`   Size: ${custom.sizeLabel}`);
        }
        if (custom.customDimensions) {
          itemBlock.push(`   Size: ${custom.customDimensions}`);
        } else if (custom.customMeasurements) {
          const w = custom.customMeasurements.width;
          const h = custom.customMeasurements.height;
          if (w && h) {
            itemBlock.push(`   Size: ${w} × ${h} in`);
          } else if (w) {
            itemBlock.push(`   Width: ${w} in`);
          } else if (h) {
            itemBlock.push(`   Height: ${h} in`);
          }
        }
        if (custom.lining) {
          itemBlock.push(`   Lining: ${custom.lining}`);
        }
        if (custom.notes) {
          itemBlock.push(`   Notes: ${custom.notes}`);
        }
        if (custom.raw && typeof custom.raw === 'string' && !custom.headingStyle && !custom.sizeLabel) {
          itemBlock.push(`   Customization: ${custom.raw}`);
        }
      }

      itemBlock.push(`   Quantity: ${qty}`);
      itemBlock.push(`   Unit Price: ₹${unitPrice.toLocaleString('en-IN')}`);
      itemBlock.push(`   Total: ₹${lineTotal.toLocaleString('en-IN')}`);

      itemsLines.push(itemBlock.join('\n'));
    });
  }
  messageSections.push(itemsLines.join('\n\n'));

  // Delivery Details
  const deliveryLines = ['*Delivery Details*'];
  if (address) deliveryLines.push(`Address: ${address}`);
  if (city) deliveryLines.push(`City: ${city}`);
  if (state) deliveryLines.push(`State: ${state}`);
  if (pincode) deliveryLines.push(`Pincode: ${pincode}`);
  if (landmark) deliveryLines.push(`Landmark: ${landmark}`);
  deliveryLines.push(`Delivery Option: ${deliveryOptionLabel}`);
  messageSections.push(deliveryLines.join('\n'));

  // Payment
  const paymentLines = [
    '*Payment*',
    `Payment Method: ${paymentMethod}`,
    `Payment Status: ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1).toLowerCase()}`,
  ];
  messageSections.push(paymentLines.join('\n'));

  // Order Total
  const totalLines = ['*Order Total*'];
  totalLines.push(`Subtotal: ₹${subtotal.toLocaleString('en-IN')}`);
  if (discount > 0) {
    totalLines.push(`Discount: ₹${discount.toLocaleString('en-IN')}`);
  }
  totalLines.push(
    `Delivery: ${deliveryCharge === 0 ? 'Complimentary' : `₹${deliveryCharge.toLocaleString('en-IN')}`}`
  );
  totalLines.push(`Total: ₹${totalAmount.toLocaleString('en-IN')}`);
  messageSections.push(totalLines.join('\n'));

  // Closing
  messageSections.push('Please confirm my order.');

  return messageSections.join('\n\n');
}

/**
 * Builds the direct WhatsApp deep-link URL to Zaira's official line
 */
export function buildOrderWhatsAppUrl(order: WhatsAppOrderData): string {
  const message = buildOrderWhatsAppMessage(order);
  return `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppQuoteData {
  productName: string;
  categoryName: string;
  variantName?: string | null;
  sizeLabel?: string | null;
  quantity: number | string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  requirements?: string | null;
  requestReference: string;
  productUrl?: string | null;
}

/**
 * Standardized WhatsApp Message Builder for Customer Quote Request
 */
export function buildQuoteWhatsAppMessage(data: WhatsAppQuoteData): string {
  const lines: string[] = [
    'ZAIRA FURNISHING — QUOTE REQUEST',
    '',
    `Product: ${data.productName}`,
    `Category: ${data.categoryName}`,
  ];

  if (data.variantName) {
    lines.push(`Variant: ${data.variantName}`);
  }
  if (data.sizeLabel) {
    lines.push(`Size: ${data.sizeLabel}`);
  }
  lines.push(`Quantity: ${data.quantity}`);

  lines.push('');
  lines.push('Customer Details:');
  lines.push(`Name: ${data.customerName}`);
  lines.push(`Phone: ${data.customerPhone}`);
  if (data.customerEmail) {
    lines.push(`Email: ${data.customerEmail}`);
  }

  if (data.requirements) {
    lines.push('');
    lines.push('Requirements:');
    lines.push(data.requirements);
  }

  lines.push('');
  lines.push('Request Reference:');
  lines.push(data.requestReference);

  if (data.productUrl) {
    lines.push('');
    lines.push('Product Link:');
    lines.push(data.productUrl);
  }

  lines.push('');
  lines.push('Please provide a quotation for this requirement.');

  return lines.join('\n');
}

/**
 * Builds direct WhatsApp URL for quote request
 */
export function buildQuoteWhatsAppUrl(data: WhatsAppQuoteData): string {
  const message = buildQuoteWhatsAppMessage(data);
  return `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppMeasurementData {
  productName: string;
  categoryName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  requirements?: string | null;
  requestReference: string;
  productUrl?: string | null;
}

/**
 * Standardized WhatsApp Message Builder for Free Measurement Request
 */
export function buildMeasurementWhatsAppMessage(data: WhatsAppMeasurementData): string {
  const lines: string[] = [
    'ZAIRA FURNISHING — FREE MEASUREMENT REQUEST',
    '',
    `Product: ${data.productName}`,
    `Category: ${data.categoryName}`,
    '',
    'Customer Details:',
    `Name: ${data.customerName}`,
    `Phone: ${data.customerPhone}`,
  ];

  if (data.customerEmail) {
    lines.push(`Email: ${data.customerEmail}`);
  }

  lines.push('');
  lines.push('Address:');
  lines.push(data.address);

  if (data.preferredDate) {
    lines.push('');
    lines.push(`Preferred Date: ${data.preferredDate}`);
  }
  if (data.preferredTime) {
    lines.push(`Preferred Time: ${data.preferredTime}`);
  }

  if (data.requirements) {
    lines.push('');
    lines.push('Requirements:');
    lines.push(data.requirements);
  }

  lines.push('');
  lines.push('Request Reference:');
  lines.push(data.requestReference);

  if (data.productUrl) {
    lines.push('');
    lines.push('Product Link:');
    lines.push(data.productUrl);
  }

  lines.push('');
  lines.push('Please confirm the free measurement visit.');

  return lines.join('\n');
}

/**
 * Builds direct WhatsApp URL for free measurement visit request
 */
export function buildMeasurementWhatsAppUrl(data: WhatsAppMeasurementData): string {
  const message = buildMeasurementWhatsAppMessage(data);
  return `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface WhatsAppDirectOrderParams {
  productName: string;
  productSlug?: string;
  variantName?: string | null;
  price: number;
  quantity: number;
  sizeLabel?: string | null;
  currency?: string;
  customDimensions?: string | null;
}

/**
 * Builds direct WhatsApp URL for 1-click product order / check availability
 */
export function buildProductOrderWhatsAppUrl(params: WhatsAppDirectOrderParams): string {
  const currency = params.currency || '₹';
  const lines: string[] = [
    'Hello Zaira Furnishing,',
    '',
    'I want to order the following item from your website:',
    `Product: ${params.productName}`,
  ];

  if (params.variantName) {
    lines.push(`Variant / Color: ${params.variantName}`);
  }
  if (params.sizeLabel) {
    lines.push(`Size: ${params.sizeLabel}`);
  }
  if (params.customDimensions) {
    lines.push(`Dimensions: ${params.customDimensions}`);
  }

  lines.push(`Quantity: ${params.quantity}`);
  lines.push('');
  lines.push('Please share current pricing, fabric swatch options, and availability.');

  if (typeof window !== 'undefined' && params.productSlug) {
    lines.push('');
    lines.push(`Link: ${window.location.origin}/products/${params.productSlug}`);
  }

  return `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export interface InquiryBagItem {
  name: string;
  variantName?: string | null;
  sizeLabel?: string | null;
  quantity: number;
  totalPrice?: number;
}

/**
 * Builds direct WhatsApp URL for entire Shortlist (multiple shortlisted items)
 */
export function buildInquiryBagWhatsAppUrl(items: InquiryBagItem[], _grandTotal = 0): string {
  const lines: string[] = [
    'Hello Zaira Furnishing,',
    '',
    'I have shortlisted the following designs on your website and would like to get pricing & availability:',
    '',
  ];

  items.forEach((item, index) => {
    let itemDesc = `${index + 1}. ${item.name} (Qty: ${item.quantity})`;
    if (item.variantName) itemDesc += ` [Color: ${item.variantName}]`;
    if (item.sizeLabel) itemDesc += ` [Size: ${item.sizeLabel}]`;
    lines.push(itemDesc);
  });

  lines.push('');
  lines.push('Please share fabric options and quotation, or schedule a free in-home measurement visit in Hyderabad.');

  return `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

