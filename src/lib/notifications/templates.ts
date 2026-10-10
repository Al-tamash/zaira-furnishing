// src/lib/notifications/templates.ts

import { DbOrder, DbOrderItem, DbMeasurementRequest, DbQuoteRequest } from '@/lib/db/types';

interface OrderItemData extends DbOrderItem {
  product_name_snapshot: string;
  variant_name_snapshot?: string | null;
  unit_price_snapshot: number;
  line_total: number;
  quantity: number;
  customization_data?: string | null;
  product_type: string;
}

const SUPPORT_PHONE = '07947415666';
const SUPPORT_EMAIL = 'concierge@zairafurnishing.com';
const SHOWROOM_ADDRESS = 'Rd Number 5, Kyetian Goud Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089';

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return 'Order Confirmed';
    case 'PROCESSING':
      return 'Processing / Atelier Preparation';
    case 'READY':
      return 'Ready for Dispatch';
    case 'COMPLETED':
      return 'Completed & Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

// ─── 1. Customer Order Confirmation Email Template ───
export function generateCustomerOrderConfirmationEmail(
  order: DbOrder,
  items: OrderItemData[]
): { subject: string; html: string; text: string } {
  const subject = `Order Confirmation #${order.order_number} — Zaira Furnishing`;
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const itemsHtml = items
    .map((item) => {
      let customDetails = '';
      if (item.customization_data) {
        try {
          const parsed = JSON.parse(item.customization_data);
          const parts: string[] = [];
          if (parsed.sizeLabel) parts.push(`Size: ${parsed.sizeLabel}`);
          if (parsed.headingStyle) parts.push(`Style: ${parsed.headingStyle}`);
          if (parsed.customDimensions) parts.push(`Dimensions: ${parsed.customDimensions}`);
          if (parts.length > 0) {
            customDetails = `<div style="font-size: 12px; color: #8C827A; margin-top: 4px;">${parts.join(' | ')}</div>`;
          }
        } catch {
          // Ignore parse errors
        }
      }

      return `
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 12px 0;">
            <div style="font-weight: 600; color: #1C1917;">${item.product_name_snapshot}</div>
            ${item.variant_name_snapshot ? `<div style="font-size: 12px; color: #78716C;">Variant: ${item.variant_name_snapshot}</div>` : ''}
            ${customDetails}
          </td>
          <td style="padding: 12px 0; text-align: center; color: #78716C;">${item.quantity}</td>
          <td style="padding: 12px 0; text-align: right; color: #1C1917; font-weight: 500;">${formatCurrency(item.unit_price_snapshot)}</td>
          <td style="padding: 12px 0; text-align: right; color: #1C1917; font-weight: 600;">${formatCurrency(item.line_total)}</td>
        </tr>
      `;
    })
    .join('');

  const itemsText = items
    .map((item) => {
      const variantStr = item.variant_name_snapshot ? ` (${item.variant_name_snapshot})` : '';
      return `- ${item.product_name_snapshot}${variantStr} × ${item.quantity} = ${formatCurrency(item.line_total)}`;
    })
    .join('\n');

  const siteVisitInfo =
    order.site_visit_required === 1 || order.delivery_option === 'service_visit'
      ? `<div style="background-color: #FAF9F5; border: 1px solid #EDE8DE; border-radius: 8px; padding: 12px; margin-top: 16px;">
           <strong style="color: #2C221E;">Master Measurement & Sizing Visit:</strong>
           <div style="font-size: 13px; color: #78716C; margin-top: 4px;">
             Requested Window: ${order.site_visit_time || 'Standard Slot (10:00 AM – 1:00 PM)'}
           </div>
         </div>`
      : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #EDE8DE; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
    <!-- Header -->
    <div style="background-color: #2C221E; padding: 30px 24px; text-align: center; color: #FAF7F2;">
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; color: #FAF7F2;">ZAIRA FURNISHING</h1>
      <div style="font-size: 11px; letter-spacing: 0.2em; color: #C4B9A1; margin-top: 4px; text-transform: uppercase;">Atelier Order Confirmation</div>
    </div>

    <!-- Body -->
    <div style="padding: 30px 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Dear <strong>${order.customer_name}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #44403C;">
        Thank you for ordering with Zaira Furnishing. Your bespoke furnishings order has been successfully recorded in our ledger.
      </p>

      <!-- Order Details Banner -->
      <div style="background-color: #FAF7F2; border: 1px solid #EDE8DE; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 13px; color: #78716C;">Order Reference:</span>
          <strong style="font-family: monospace; font-size: 14px; color: #1C1917;">#${order.order_number}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 13px; color: #78716C;">Order Date:</span>
          <span style="font-size: 13px; color: #1C1917;">${orderDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 13px; color: #78716C;">Payment Method:</span>
          <strong style="font-size: 13px; color: #2C221E;">Cash on Delivery (COD)</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 13px; color: #78716C;">Order Status:</span>
          <span style="font-size: 13px; font-weight: 600; color: #15803D;">${formatStatusLabel(order.status)}</span>
        </div>
      </div>

      <!-- Items Table -->
      <h3 style="font-family: Georgia, serif; font-size: 16px; color: #1C1917; margin: 24px 0 12px 0;">Ordered Furnishings</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 2px solid #EDE8DE; text-align: left; color: #8C827A; font-size: 11px; text-transform: uppercase;">
            <th style="padding-bottom: 8px;">Item</th>
            <th style="padding-bottom: 8px; text-align: center;">Qty</th>
            <th style="padding-bottom: 8px; text-align: right;">Unit Price</th>
            <th style="padding-bottom: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #EDE8DE; text-align: right; font-size: 13px;">
        <div style="margin-bottom: 6px; color: #78716C;">
          Subtotal: <span style="font-family: monospace; color: #1C1917;">${formatCurrency(order.subtotal)}</span>
        </div>
        ${order.discount > 0 ? `<div style="margin-bottom: 6px; color: #15803D;">Discount: -${formatCurrency(order.discount)}</div>` : ''}
        <div style="margin-bottom: 8px; color: #78716C;">
          Delivery & Atelier Service: <span style="font-family: monospace; color: #1C1917;">${order.delivery_charge === 0 ? 'Complimentary' : formatCurrency(order.delivery_charge)}</span>
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #2C221E; padding-top: 8px; border-top: 1px solid #F2ECE1;">
          Total Payable on Delivery (COD): <span style="font-family: Georgia, serif; font-size: 18px;">${formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      <!-- Delivery Address -->
      <div style="margin-top: 24px;">
        <h4 style="font-size: 13px; text-transform: uppercase; color: #8C827A; letter-spacing: 0.1em; margin-bottom: 6px;">Delivery Destination</h4>
        <div style="font-size: 13px; line-height: 1.5; color: #1C1917;">
          ${order.delivery_address}<br>
          ${order.landmark ? `Landmark: ${order.landmark}<br>` : ''}
          ${order.city}, ${order.state} – ${order.pincode}
        </div>
        ${siteVisitInfo}
      </div>

      <!-- Contact Concierge -->
      <div style="margin-top: 28px; padding: 16px; background-color: #FAF7F2; border-radius: 8px; text-align: center; font-size: 12px; color: #78716C;">
        <div>Need assistance or wish to review bespoke specifications?</div>
        <div style="margin-top: 6px;">
          Phone / WhatsApp: <a href="tel:${SUPPORT_PHONE.replace(/\s+/g, '')}" style="color: #2C221E; font-weight: 600; text-decoration: none;">${SUPPORT_PHONE}</a> · 
          Email: <a href="mailto:${SUPPORT_EMAIL}" style="color: #2C221E; font-weight: 600; text-decoration: none;">${SUPPORT_EMAIL}</a>
        </div>
        <div style="margin-top: 4px; font-size: 11px; color: #A8A29E;">
          Showroom: ${SHOWROOM_ADDRESS}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
ZAIRA FURNISHING — ATELIER ORDER CONFIRMATION
==================================================

Dear ${order.customer_name},

Thank you for your order with Zaira Furnishing. Your order has been recorded.

Order Reference: #${order.order_number}
Order Date: ${orderDate}
Payment Method: Cash on Delivery (COD)
Current Status: ${formatStatusLabel(order.status)}

ORDERED ITEMS:
${itemsText}

Subtotal: ${formatCurrency(order.subtotal)}
Delivery & Atelier Service: ${order.delivery_charge === 0 ? 'Complimentary' : formatCurrency(order.delivery_charge)}
Total Amount Payable on Delivery: ${formatCurrency(order.total_amount)}

DELIVERY DESTINATION:
${order.delivery_address}
${order.landmark ? `Landmark: ${order.landmark}\n` : ''}${order.city}, ${order.state} – ${order.pincode}
${order.site_visit_required === 1 ? `Master Measurement Window: ${order.site_visit_time || 'Standard'}\n` : ''}

CUSTOMER SUPPORT & CONCIERGE:
Phone / WhatsApp: ${SUPPORT_PHONE}
Email: ${SUPPORT_EMAIL}
Showroom: ${SHOWROOM_ADDRESS}
  `.trim();

  return { subject, html, text };
}

// ─── 2. Admin New Order Alert Email Template ───
export function generateAdminNewOrderEmail(
  order: DbOrder,
  items: OrderItemData[]
): { subject: string; html: string; text: string } {
  const isWhatsApp = order.order_source === 'WHATSAPP';
  const prefix = isWhatsApp ? '[New WhatsApp Order]' : '[New Order Alert]';
  const subject = `${prefix} #${order.order_number} — ${formatCurrency(order.total_amount)} (COD)`;
  const adminOrderDetailUrl = `${getSiteUrl()}/admin/orders/${order.order_number}`;

  const itemsSummary = items
    .map((i) => `${i.product_name_snapshot} (×${i.quantity})`)
    .join(', ');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C1917;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #EDE8DE; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #2C221E; padding: 20px 24px; color: #FAF7F2;">
      <h2 style="margin: 0; font-family: Georgia, serif; font-size: 18px; color: #FAF7F2;">New Customer Order Placed</h2>
      <div style="font-size: 12px; color: #C4B9A1; margin-top: 4px;">Cloudflare D1 Production Ledger</div>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 12px; color: #78716C; text-transform: uppercase;">Order Reference:</span>
        <div style="font-family: monospace; font-size: 18px; font-weight: bold; color: #1C1917;">#${order.order_number}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr><td style="padding: 6px 0; color: #78716C;">Customer:</td><td style="padding: 6px 0; font-weight: 600;">${order.customer_name}</td></tr>
        <tr><td style="padding: 6px 0; color: #78716C;">Phone:</td><td style="padding: 6px 0;">${order.customer_phone}</td></tr>
        <tr><td style="padding: 6px 0; color: #78716C;">Email:</td><td style="padding: 6px 0;">${order.customer_email}</td></tr>
        <tr><td style="padding: 6px 0; color: #78716C;">Total Amount:</td><td style="padding: 6px 0; font-weight: bold; color: #2C221E;">${formatCurrency(order.total_amount)} (COD)</td></tr>
        <tr><td style="padding: 6px 0; color: #78716C;">Destination:</td><td style="padding: 6px 0;">${order.city}, ${order.state}</td></tr>
        <tr><td style="padding: 6px 0; color: #78716C;">Service Type:</td><td style="padding: 6px 0;">${order.delivery_option === 'service_visit' ? 'Sizing Visit Requested' : 'Standard Delivery'}</td></tr>
        <tr><td style="padding: 6px 0; color: #78716C;">Products:</td><td style="padding: 6px 0;">${itemsSummary}</td></tr>
      </table>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${adminOrderDetailUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2C221E; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">Open Order in Admin Atelier</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
NEW ORDER ALERT — ZAIRA FURNISHING
==================================================
Order Reference: #${order.order_number}
Customer: ${order.customer_name} (${order.customer_phone}, ${order.customer_email})
Total Amount: ${formatCurrency(order.total_amount)}
Payment Method: Cash on Delivery (COD)
Destination: ${order.city}, ${order.state}
Service: ${order.delivery_option}
Items: ${itemsSummary}

Manage in Admin Atelier:
${adminOrderDetailUrl}
  `.trim();

  return { subject, html, text };
}

// ─── 3. Customer Order Status Update Email Template ───
export function generateCustomerStatusUpdateEmail(
  order: DbOrder,
  previousStatus: string,
  newStatus: string
): { subject: string; html: string; text: string } {
  const newStatusLabel = formatStatusLabel(newStatus);
  const previousStatusLabel = formatStatusLabel(previousStatus);

  let statusHeadline = `Your order status is now ${newStatusLabel}.`;
  let subject = `Order #${order.order_number} Status Update: ${newStatusLabel} — Zaira Furnishing`;

  switch (newStatus.toUpperCase()) {
    case 'PROCESSING':
      statusHeadline = 'Your order is now being processed.';
      subject = `Order #${order.order_number}: Your order is now being processed — Zaira Furnishing`;
      break;
    case 'READY':
      statusHeadline = 'Your order is ready.';
      subject = `Order #${order.order_number}: Your order is ready — Zaira Furnishing`;
      break;
    case 'COMPLETED':
      statusHeadline = 'Your order has been completed.';
      subject = `Order #${order.order_number}: Your order has been completed — Zaira Furnishing`;
      break;
    case 'CANCELLED':
      statusHeadline = 'Your order has been cancelled.';
      subject = `Order #${order.order_number}: Your order has been cancelled — Zaira Furnishing`;
      break;
  }

  const trackingUrl = `${getSiteUrl()}/account/orders/${order.order_number}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C1917;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #EDE8DE; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #2C221E; padding: 24px; text-align: center; color: #FAF7F2;">
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.1em; text-transform: uppercase;">ZAIRA FURNISHING</h1>
      <div style="font-size: 11px; letter-spacing: 0.2em; color: #C4B9A1; margin-top: 4px; text-transform: uppercase;">Fulfillment Status Update</div>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px; margin-top: 0;">
        Dear <strong>${order.customer_name}</strong>,
      </p>
      <p style="font-size: 16px; font-weight: 600; color: #1C1917; margin: 12px 0;">
        ${statusHeadline}
      </p>
      <p style="font-size: 13.5px; line-height: 1.6; color: #57534E;">
        Order Reference: <strong style="font-family: monospace; color: #1C1917;">#${order.order_number}</strong>
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #EDE8DE; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <div style="font-size: 11px; color: #8C827A; text-transform: uppercase; letter-spacing: 0.05em;">Previous Status</div>
        <div style="font-size: 13px; color: #78716C; text-decoration: line-through; margin-bottom: 6px;">${previousStatusLabel}</div>
        <div style="font-size: 16px; color: #9A7B56; margin: 2px 0;">↓</div>
        <div style="font-size: 11px; color: #8C827A; text-transform: uppercase; letter-spacing: 0.05em;">Current Status</div>
        <div style="font-size: 15px; font-weight: bold; color: ${newStatus.toUpperCase() === 'CANCELLED' ? '#BE123C' : '#2C221E'};">${newStatusLabel}</div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2C221E; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">Track Order in Customer Portal</a>
      </div>

      <div style="padding: 16px; background-color: #FAF7F2; border-radius: 8px; text-align: center; font-size: 12px; color: #78716C;">
        Questions about your furnishings? WhatsApp our concierge at <a href="tel:${SUPPORT_PHONE.replace(/\s+/g, '')}" style="color: #2C221E; font-weight: 600;">${SUPPORT_PHONE}</a> or email <a href="mailto:${SUPPORT_EMAIL}" style="color: #2C221E; font-weight: 600;">${SUPPORT_EMAIL}</a>.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
ZAIRA FURNISHING — ORDER STATUS UPDATE
==================================================
Dear ${order.customer_name},

Order Reference: #${order.order_number}

${statusHeadline}

Previous Status: ${previousStatusLabel}
Current Status: ${newStatusLabel}

Track order details online:
${trackingUrl}

Support:
Phone / WhatsApp: ${SUPPORT_PHONE}
Email: ${SUPPORT_EMAIL}
  `.trim();

  return { subject, html, text };
}

// ─── 4. Admin Measurement / Consultation Request Alert ───
export function generateAdminMeasurementRequestEmail(
  request: DbMeasurementRequest
): { subject: string; html: string; text: string } {
  const isConsultation =
    request.product_name_snapshot?.toLowerCase().includes('consultation') ||
    request.category_slug_snapshot === 'services';
  const label = isConsultation ? 'In-Home Consultation' : 'Free Measurement Visit';
  const subject = `[New ${label} Alert] #${request.request_number} — ${request.customer_name}`;
  const adminUrl = `${getSiteUrl()}/admin/measurement-requests`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C1917;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #EDE8DE; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #2C221E; padding: 24px; text-align: center; color: #FAF7F2;">
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.1em; text-transform: uppercase;">ZAIRA ATELIER ALERT</h1>
      <div style="font-size: 11px; letter-spacing: 0.2em; color: #C4B9A1; margin-top: 4px; text-transform: uppercase;">
        New ${label} Received
      </div>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px; margin-top: 0; color: #57534E;">
        A new ${label.toLowerCase()} booking has been submitted on the Zaira Furnishing portal.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C; width: 140px;">Request Ref:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1C1917;">#${request.request_number}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Customer:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #1C1917;">${request.customer_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Phone:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #2C221E;">
            <a href="tel:${request.customer_phone}" style="color: #2C221E; text-decoration: none;">${request.customer_phone}</a>
            &nbsp;•&nbsp;
            <a href="https://wa.me/91${request.customer_phone.replace(/\D/g, '')}" style="color: #15803D; text-decoration: none; font-weight: bold;">WhatsApp ↗</a>
          </td>
        </tr>
        ${request.customer_email ? `
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Email:</td>
          <td style="padding: 8px 0; color: #1C1917;">${request.customer_email}</td>
        </tr>` : ''}
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Service / Product:</td>
          <td style="padding: 8px 0; font-weight: 500; color: #1C1917;">${request.product_name_snapshot}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Preferred Slot:</td>
          <td style="padding: 8px 0; color: #1C1917;"><strong>${request.preferred_date}</strong> (${request.preferred_time_slot})</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Site Address:</td>
          <td style="padding: 8px 0; color: #1C1917;">${request.address}</td>
        </tr>
        ${request.customer_notes ? `
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C; vertical-align: top;">Notes / Scope:</td>
          <td style="padding: 8px 0; color: #57534E; white-space: pre-wrap;">${request.customer_notes}</td>
        </tr>` : ''}
      </table>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${adminUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2C221E; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
          Open in Admin Console →
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
ZAIRA ATELIER ALERT — NEW ${label.toUpperCase()}
==================================================
Ref: #${request.request_number}
Customer: ${request.customer_name}
Phone: ${request.customer_phone}
${request.customer_email ? `Email: ${request.customer_email}\n` : ''}Service: ${request.product_name_snapshot}
Slot: ${request.preferred_date} (${request.preferred_time_slot})
Address: ${request.address}
${request.customer_notes ? `Notes: ${request.customer_notes}\n` : ''}
Open in Admin Console:
${adminUrl}
  `.trim();

  return { subject, html, text };
}

// ─── 5. Admin Quote Request Alert ───
export function generateAdminQuoteRequestEmail(
  request: DbQuoteRequest
): { subject: string; html: string; text: string } {
  const subject = `[New Quote Request Alert] #${request.request_number} — ${request.customer_name}`;
  const adminUrl = `${getSiteUrl()}/admin/quote-requests`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1C1917;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #EDE8DE; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #2C221E; padding: 24px; text-align: center; color: #FAF7F2;">
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 20px; letter-spacing: 0.1em; text-transform: uppercase;">ZAIRA ATELIER ALERT</h1>
      <div style="font-size: 11px; letter-spacing: 0.2em; color: #C4B9A1; margin-top: 4px; text-transform: uppercase;">
        New Quote Request Received
      </div>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 14px; margin-top: 0; color: #57534E;">
        A new bespoke quote inquiry has been submitted.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C; width: 140px;">Request Ref:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #1C1917;">#${request.request_number}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Customer:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #1C1917;">${request.customer_name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Phone:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #2C221E;">
            <a href="tel:${request.customer_phone}" style="color: #2C221E; text-decoration: none;">${request.customer_phone}</a>
            &nbsp;•&nbsp;
            <a href="https://wa.me/91${request.customer_phone.replace(/\D/g, '')}" style="color: #15803D; text-decoration: none; font-weight: bold;">WhatsApp ↗</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Product / Service:</td>
          <td style="padding: 8px 0; font-weight: 500; color: #1C1917;">${request.product_name_snapshot}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C;">Quantity:</td>
          <td style="padding: 8px 0; color: #1C1917;">${request.quantity}</td>
        </tr>
        ${request.customer_notes ? `
        <tr style="border-bottom: 1px solid #F2ECE1;">
          <td style="padding: 8px 0; color: #78716C; vertical-align: top;">Requirements:</td>
          <td style="padding: 8px 0; color: #57534E; white-space: pre-wrap;">${request.customer_notes}</td>
        </tr>` : ''}
      </table>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${adminUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2C221E; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
          Open in Admin Console →
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
ZAIRA ATELIER ALERT — NEW QUOTE REQUEST
==================================================
Ref: #${request.request_number}
Customer: ${request.customer_name}
Phone: ${request.customer_phone}
${request.customer_email ? `Email: ${request.customer_email}\n` : ''}Product: ${request.product_name_snapshot}
Quantity: ${request.quantity}
${request.customer_notes ? `Requirements: ${request.customer_notes}\n` : ''}
Open in Admin Console:
${adminUrl}
  `.trim();

  return { subject, html, text };
}

