import {
  APP_NAME,
  APP_URL,
  CAMPUS_NAME,
  CAMPUS_SHORT_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_NUMBER,
} from "@/config/site";
import { formatPrice } from "@/lib/format";
import { IOrder } from "@/models/Order";
import { User } from "@/models/User";
import { connectDB, isDatabaseConfigured } from "@/lib/db";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Core resilient email dispatcher using Resend HTTP API.
 * Never throws exceptions so email transport failures never interrupt checkout or operations.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<boolean> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) {
    console.warn("[Email Warning] Attempted to send email with no recipients:", subject);
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.EMAIL_FROM || `${APP_NAME} <orders@dripplug.com.ng>`;

  // Development / fallback mode when Resend is not configured
  if (!apiKey || apiKey === "re_your_resend_api_key") {
    console.log(
      `\n--------------------------------------------------\n` +
      `[Email Fallback - Dev Mode]\n` +
      `From:    ${fromEmail}\n` +
      `To:      ${recipients.join(", ")}\n` +
      `Subject: ${subject}\n` +
      `--------------------------------------------------\n`
    );
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(
        `[Email Error] Resend API responded with status ${res.status}:`,
        errBody
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Email Error] Failed to send email via Resend:", err);
    return false;
  }
}

/**
 * Retrieves the email addresses of every user with role="admin" in MongoDB,
 * plus any fallback admin email defined in ADMIN_EMAIL environment variable.
 */
export async function getAdminEmails(): Promise<string[]> {
  const envAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const fallback = envAdmin || "admin@dripplug.com.ng";

  if (!isDatabaseConfigured()) {
    return [fallback];
  }

  try {
    await connectDB();
    const adminDocs = await User.find({ role: "admin" }).select("email").lean();
    const emails = adminDocs
      .map((a) => a.email?.trim().toLowerCase())
      .filter((e): e is string => Boolean(e));

    if (envAdmin && !emails.includes(envAdmin)) {
      emails.push(envAdmin);
    }

    // Default fallback if no admin accounts exist yet
    if (emails.length === 0) {
      return [fallback];
    }

    return Array.from(new Set(emails));
  } catch (err) {
    console.error("[Email Error] Could not query admin emails:", err);
    return [fallback];
  }
}

/**
 * Reusable HTML wrapper matching Dripplug's bold campus aesthetic.
 */
function wrapEmailTemplate({
  headline,
  badgeText,
  badgeColor = "#000000",
  bodyContent,
  footerNote,
}: {
  headline: string;
  badgeText?: string;
  badgeColor?: string;
  bodyContent: string;
  footerNote?: string;
}): string {
  const badgeHtml = badgeText
    ? `<span style="display:inline-block;padding:4px 12px;background:${badgeColor};color:#ffffff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:20px;margin-bottom:12px;">${badgeText}</span>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 28px 20px 28px;border-bottom:1px solid #f0eeed;background:#000000;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;color:#ffffff;">
                      ${APP_NAME}
                    </h1>
                    <p style="margin:4px 0 0;font-size:11px;color:#a3a3a3;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                      ${CAMPUS_SHORT_NAME} Campus Fashion Hub
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:28px;">
              ${badgeHtml}
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#000000;letter-spacing:-0.3px;">
                ${headline}
              </h2>
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 28px;background:#fafafa;border-top:1px solid #eeeeee;font-size:12px;color:#737373;line-height:1.6;">
              ${
                footerNote
                  ? `<p style="margin:0 0 12px;color:#525252;">${footerNote}</p>`
                  : ""
              }
              <p style="margin:0;">
                <strong>${APP_NAME} &bull; ${CAMPUS_NAME}</strong><br/>
                Fast pickup at Old Park & New Park terminals &bull; Room drop-off to student hostels.<br/>
                Need help? WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#000000;font-weight:600;text-decoration:none;">+${WHATSAPP_NUMBER}</a> &bull; Email: <a href="mailto:${SUPPORT_EMAIL}" style="color:#000000;text-decoration:none;">${SUPPORT_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Builds table HTML for order items.
 */
function renderOrderItemsTable(items: IOrder["items"]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
          <div style="font-weight:600;font-size:14px;color:#111111;">${item.name}</div>
          <div style="font-size:12px;color:#666666;margin-top:2px;">
            Size: <strong style="color:#333;">${item.size}</strong> &bull; Color: <strong style="color:#333;">${item.color}</strong> &bull; Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:700;font-size:14px;color:#000000;vertical-align:top;">
          ${formatPrice(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;border-collapse:collapse;">
      ${rows}
    </table>
  `;
}

/**
 * Builds delivery location card.
 */
function renderDeliveryPointCard(order: IOrder): string {
  const hostelInfo = order.deliveryAddress.hostel
    ? `<div style="margin-top:4px;font-size:13px;color:#444444;">
        <strong>Hostel:</strong> ${order.deliveryAddress.hostel}${
        order.deliveryAddress.room ? `, Room ${order.deliveryAddress.room}` : ""
      }${
        order.deliveryAddress.landmark
          ? ` <span style="color:#777;">(${order.deliveryAddress.landmark})</span>`
          : ""
      }
      </div>`
    : "";

  return `
    <div style="background:#f0eeed;padding:16px;border-radius:12px;margin:16px 0;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#525252;margin-bottom:4px;">
        Campus Delivery Point
      </div>
      <div style="font-size:15px;font-weight:700;color:#000000;">
        ${order.deliveryPoint.name} &bull; ${formatPrice(order.deliveryFee)}
      </div>
      ${order.deliveryPoint.estimatedTime ? `<div style="font-size:12px;color:#666666;margin-top:2px;">ETA: ${order.deliveryPoint.estimatedTime}</div>` : ""}
      ${hostelInfo}
    </div>
  `;
}

/* =======================================================================
   1. EVENT: ORDER PAID SUCCESSFULLY -> CUSTOMER CONFIRMATION
   ======================================================================= */
export async function sendOrderConfirmationEmail(order: IOrder): Promise<void> {
  try {
    const itemsTable = renderOrderItemsTable(order.items);
    const deliveryCard = renderDeliveryPointCard(order);

    const discountRow =
      order.discount > 0
        ? `<tr>
            <td style="padding:4px 0;color:#01AB31;font-size:13px;">Discount (${order.couponCode || "Coupon"}):</td>
            <td style="padding:4px 0;text-align:right;color:#01AB31;font-size:13px;font-weight:600;">-${formatPrice(order.discount)}</td>
          </tr>`
        : "";

    const bodyContent = `
      <p style="font-size:15px;line-height:1.5;color:#333333;margin:0 0 16px;">
        Hi <strong>${order.deliveryAddress.customerName}</strong>, your payment for order <strong>#${order.orderNumber}</strong> has been confirmed! Our dispatch crew is packing your campus drip.
      </p>

      ${deliveryCard}

      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#525252;margin-top:20px;">
        Items Ordered
      </div>
      ${itemsTable}

      <!-- Order Totals -->
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
        <tr>
          <td style="padding:4px 0;color:#666666;font-size:13px;">Subtotal:</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600;">${formatPrice(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666666;font-size:13px;">Delivery Fee:</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600;">${formatPrice(order.deliveryFee)}</td>
        </tr>
        ${discountRow}
        <tr>
          <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#000000;border-top:2px solid #000000;">Total Paid:</td>
          <td style="padding:10px 0 0;text-align:right;font-size:18px;font-weight:900;color:#000000;border-top:2px solid #000000;">${formatPrice(order.total)}</td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/orders/${order.orderNumber}" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Track Your Order Live &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `Order Confirmed: #${order.orderNumber}`,
      badgeText: "Payment Confirmed",
      badgeColor: "#01AB31",
      bodyContent,
      footerNote: `We will notify you via email as soon as your rider heads to ${order.deliveryPoint.name}. Keep your phone reachable at ${order.deliveryAddress.phone}.`,
    });

    await sendEmail({
      to: order.deliveryAddress.email,
      subject: `Order Confirmed: #${order.orderNumber} | ${APP_NAME}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendOrderConfirmationEmail:", err);
  }
}

/* =======================================================================
   2. EVENT: ORDER PAID SUCCESSFULLY -> EVERY ADMIN NOTIFICATION
   ======================================================================= */
export async function sendAdminNewOrderNotification(order: IOrder): Promise<void> {
  try {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    const itemsTable = renderOrderItemsTable(order.items);
    const deliveryCard = renderDeliveryPointCard(order);

    const bodyContent = `
      <p style="font-size:15px;line-height:1.5;color:#111111;margin:0 0 16px;">
        A new order has just been paid on Paystack and is ready for packaging and dispatch!
      </p>

      <!-- Customer Details Card -->
      <div style="background:#ffffff;border:1px solid #e5e5e5;padding:16px;border-radius:12px;margin:16px 0;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#525252;margin-bottom:8px;">
          Customer & Contact
        </div>
        <div style="font-size:14px;margin-bottom:4px;"><strong>Name:</strong> ${order.deliveryAddress.customerName}</div>
        <div style="font-size:14px;margin-bottom:4px;">
          <strong>Phone:</strong> <a href="tel:${order.deliveryAddress.phone}" style="color:#000000;font-weight:600;">${order.deliveryAddress.phone}</a>
          &bull; <a href="https://wa.me/${order.deliveryAddress.phone.replace(/\D/g, "")}" style="color:#01AB31;font-weight:600;">WhatsApp</a>
        </div>
        <div style="font-size:14px;"><strong>Email:</strong> <a href="mailto:${order.deliveryAddress.email}" style="color:#000000;">${order.deliveryAddress.email}</a></div>
      </div>

      ${deliveryCard}

      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#525252;margin-top:20px;">
        Items to Pack
      </div>
      ${itemsTable}

      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
        <tr>
          <td style="padding:4px 0;color:#666666;font-size:13px;">Total Items:</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600;">
            ${order.items.reduce((acc, i) => acc + i.quantity, 0)} unit(s)
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666666;font-size:13px;">Paystack Ref:</td>
          <td style="padding:4px 0;text-align:right;font-size:12px;font-family:monospace;color:#525252;">${order.paystackReference}</td>
        </tr>
        <tr>
          <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#000000;border-top:2px solid #000000;">Amount Paid:</td>
          <td style="padding:10px 0 0;text-align:right;font-size:18px;font-weight:900;color:#01AB31;border-top:2px solid #000000;">${formatPrice(order.total)}</td>
        </tr>
      </table>

      <!-- Admin Action CTA -->
      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/admin/orders" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Open Order in Admin Dashboard &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `🔥 New Order: #${order.orderNumber} (${formatPrice(order.total)})`,
      badgeText: "Admin Alert &bull; New Paid Order",
      badgeColor: "#000000",
      bodyContent,
      footerNote: `This automated notification was dispatched to all active store administrators (${adminEmails.join(", ")}).`,
    });

    await sendEmail({
      to: adminEmails,
      subject: `🔥 New Order #${order.orderNumber} (${formatPrice(order.total)}) - ${order.deliveryPoint.name}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendAdminNewOrderNotification:", err);
  }
}

/* =======================================================================
   3. EVENT: ORDER STATUS UPDATE -> CUSTOMER NOTIFICATION
   ======================================================================= */
export async function sendOrderStatusUpdateEmail(
  order: IOrder,
  previousStatus: string,
  newStatus: string,
  adminNote?: string
): Promise<void> {
  try {
    let subject = `Order #${order.orderNumber} Status Update | ${APP_NAME}`;
    let badgeText = newStatus.toUpperCase();
    let badgeColor = "#000000";
    let messageBody = "";

    switch (newStatus) {
      case "processing":
        subject = `Your Order #${order.orderNumber} is Being Packed | ${APP_NAME}`;
        badgeText = "Order In Progress";
        badgeColor = "#3B82F6";
        messageBody = `
          Great news! Your drip is currently being gathered and packaged at our campus center.
          We will send you another update once our campus rider picks it up.
        `;
        break;

      case "out_for_delivery":
        subject = `🚀 Your Order #${order.orderNumber} is Out for Delivery | ${APP_NAME}`;
        badgeText = "Out for Delivery";
        badgeColor = "#F59E0B";
        messageBody = `
          Our campus dispatch rider is currently on the move with your order to <strong>${order.deliveryPoint.name}</strong>!
          ${
            order.deliveryAddress.hostel
              ? `<br/><br/>Direct room drop-off destination: <strong>${order.deliveryAddress.hostel}, Room ${order.deliveryAddress.room || ""}</strong>.`
              : `<br/><br/>Please proceed to <strong>${order.deliveryPoint.name} terminal</strong> when your rider rings you.`
          }
          <br/><br/><strong>Please keep your phone reachable at ${order.deliveryAddress.phone}.</strong>
        `;
        break;

      case "delivered":
        subject = `🎉 Delivered: Your Order #${order.orderNumber} | ${APP_NAME}`;
        badgeText = "Order Delivered";
        badgeColor = "#01AB31";
        messageBody = `
          Your package has been successfully delivered! We hope you love your new pieces.
          <br/><br/>
          How was the fit and service? Share your feedback with fellow UNILORIN students by leaving a verified review!
        `;
        break;

      case "cancelled":
        subject = `Order #${order.orderNumber} Cancelled | ${APP_NAME}`;
        badgeText = "Order Cancelled";
        badgeColor = "#FF3333";
        messageBody = `
          Your order #${order.orderNumber} has been marked as cancelled.
          If this was an error or you need a refund check, please reply to this email or chat with our campus support immediately on WhatsApp.
        `;
        break;

      default:
        messageBody = `The status of your order #${order.orderNumber} has been updated to <strong>${newStatus}</strong>.`;
        break;
    }

    const noteSection = adminNote
      ? `<div style="background:#f0eeed;padding:14px;border-radius:10px;margin:16px 0;font-size:13px;color:#333333;">
          <strong>Staff note:</strong> ${adminNote}
        </div>`
      : "";

    const bodyContent = `
      <p style="font-size:15px;line-height:1.6;color:#333333;margin:0 0 16px;">
        Hi <strong>${order.deliveryAddress.customerName}</strong>,<br/>
        ${messageBody}
      </p>

      ${noteSection}
      ${renderDeliveryPointCard(order)}

      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/orders/${order.orderNumber}" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          View Order Details &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `Order Update: #${order.orderNumber}`,
      badgeText,
      badgeColor,
      bodyContent,
      footerNote: `Order placed on ${new Date(order.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} &bull; Paystack Ref: ${order.paystackReference}`,
    });

    await sendEmail({
      to: order.deliveryAddress.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendOrderStatusUpdateEmail:", err);
  }
}

/* =======================================================================
   4. EVENT: LOW STOCK ALERT -> EVERY ADMIN
   ======================================================================= */
export interface LowStockAlertItem {
  name: string;
  size: string;
  color: string;
  sku: string;
  remainingStock: number;
  productId: string;
}

export async function sendAdminLowStockNotification(
  items: LowStockAlertItem[]
): Promise<void> {
  if (items.length === 0) return;

  try {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    const rows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;">
            <div style="font-weight:700;font-size:14px;color:#000000;">${item.name}</div>
            <div style="font-size:12px;color:#666666;">
              Variant: ${item.size} / ${item.color} &bull; SKU: <span style="font-family:monospace;">${item.sku}</span>
            </div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eeeeee;text-align:right;vertical-align:top;">
            <span style="display:inline-block;padding:3px 10px;background:#FFEBEB;color:#FF3333;font-size:12px;font-weight:700;border-radius:12px;">
              ${item.remainingStock} left
            </span>
          </td>
        </tr>
      `
      )
      .join("");

    const bodyContent = `
      <p style="font-size:15px;line-height:1.5;color:#111111;margin:0 0 16px;">
        The following <strong>${items.length} item variant(s)</strong> have fallen to or below the low stock threshold (5 units) following recent campus sales:
      </p>

      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;border-collapse:collapse;">
        ${rows}
      </table>

      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/admin/products" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Manage Products in Admin &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `⚠️ Low Stock Alert (${items.length} Variants)`,
      badgeText: "Inventory Alert",
      badgeColor: "#FF3333",
      bodyContent,
      footerNote: `Please restock these variants to avoid out-of-stock backorders on the storefront.`,
    });

    await sendEmail({
      to: adminEmails,
      subject: `⚠️ Low Stock Alert: ${items.length} variant(s) running low | ${APP_NAME}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendAdminLowStockNotification:", err);
  }
}

/* =======================================================================
   5. EVENT: PAYMENT AMOUNT MISMATCH -> EVERY ADMIN
   ======================================================================= */
export async function sendAdminPaymentMismatchNotification(
  order: IOrder,
  expectedKobo: number,
  receivedKobo: number,
  currency: string
): Promise<void> {
  try {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    const bodyContent = `
      <p style="font-size:15px;line-height:1.5;color:#111111;margin:0 0 16px;">
        A Paystack charge webhook succeeded, but the payment amount or currency does not match the order calculation. 
        The order has been flagged and inventory was <strong>not</strong> automatically deducted.
      </p>

      <div style="background:#FFEBEB;border:1px solid #FF3333;padding:16px;border-radius:12px;margin:16px 0;">
        <div style="font-size:13px;color:#FF3333;font-weight:700;margin-bottom:6px;">Mismatch Details:</div>
        <div style="font-size:14px;color:#111111;"><strong>Expected:</strong> ${formatPrice(expectedKobo / 100)} (${expectedKobo} kobo)</div>
        <div style="font-size:14px;color:#111111;margin-top:4px;"><strong>Received:</strong> ₦${(receivedKobo / 100).toLocaleString()} (${receivedKobo} kobo) [${currency}]</div>
      </div>

      <div style="font-size:14px;line-height:1.6;margin:16px 0;">
        <strong>Order:</strong> #${order.orderNumber}<br/>
        <strong>Customer:</strong> ${order.deliveryAddress.customerName} (${order.deliveryAddress.email}, ${order.deliveryAddress.phone})<br/>
        <strong>Reference:</strong> ${order.paystackReference}
      </div>

      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/admin/orders" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Review Flagged Order in Admin &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `🚨 Payment Amount Mismatch: #${order.orderNumber}`,
      badgeText: "Security Alert",
      badgeColor: "#FF3333",
      bodyContent,
      footerNote: `Immediate manual reconciliation is required before releasing goods to this customer.`,
    });

    await sendEmail({
      to: adminEmails,
      subject: `🚨 Security Alert: Payment Mismatch on #${order.orderNumber} | ${APP_NAME}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendAdminPaymentMismatchNotification:", err);
  }
}

/* =======================================================================
   6. EVENT: NEW CUSTOMER SIGNUP -> CUSTOMER WELCOME
   ======================================================================= */
export async function sendCustomerWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name?: string;
}): Promise<void> {
  try {
    const greetingName = name?.trim() ? ` ${name.trim()}` : "";

    const bodyContent = `
      <p style="font-size:15px;line-height:1.6;color:#333333;margin:0 0 16px;">
        Welcome to <strong>${APP_NAME}</strong>${greetingName}! We're thrilled to have you join the premier fashion community at ${CAMPUS_NAME}.
      </p>

      <div style="background:#f0eeed;padding:16px;border-radius:12px;margin:18px 0;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#525252;margin-bottom:6px;">
          Campus Perks For You
        </div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#333333;line-height:1.8;">
          <li><strong>Free Old Park Drop-off:</strong> Pick up your tees, jerseys, and baggy jeans right at Old Park.</li>
          <li><strong>Hostel Room Delivery:</strong> Same-day drop-off right to your hostel door across campus.</li>
          <li><strong>100% Student Vetted:</strong> High-grade streetwear curated for everyday UNILORIN lifestyle.</li>
        </ul>
      </div>

      <p style="font-size:14px;line-height:1.6;color:#444444;">
        Use coupon code <strong style="background:#000000;color:#ffffff;padding:2px 8px;border-radius:4px;font-family:monospace;">UNILORIN10</strong> on your first order of ₦10,000 or more to get <strong>10% off</strong>!
      </p>

      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/shop" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Explore New Drops &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `Welcome to the Dripplug Family 🔥`,
      badgeText: "Welcome",
      badgeColor: "#000000",
      bodyContent,
      footerNote: `Follow our campus drops on Instagram & TikTok @dripplug_ng`,
    });

    await sendEmail({
      to: email,
      subject: `Welcome to Dripplug 🔥 Your Campus Drip is Here`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendCustomerWelcomeEmail:", err);
  }
}

/* =======================================================================
   7. EVENT: NEWSLETTER SUBSCRIPTION -> SUBSCRIBER WELCOME
   ======================================================================= */
export async function sendNewsletterWelcomeEmail(email: string): Promise<void> {
  try {
    const bodyContent = `
      <p style="font-size:15px;line-height:1.6;color:#333333;margin:0 0 16px;">
        You're officially subscribed to the <strong>${APP_NAME} VIP Drop List</strong>!
      </p>

      <p style="font-size:14px;line-height:1.6;color:#444444;">
        You will be first in line when limited-edition university jerseys, vintage wash baggy jeans, and oversized hoodies drop on campus.
      </p>

      <div style="background:#000000;color:#ffffff;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#a3a3a3;margin-bottom:6px;">Your Campus Promo Code</div>
        <div style="font-size:24px;font-weight:900;letter-spacing:2px;font-family:monospace;color:#ffffff;">UNILORIN10</div>
        <div style="font-size:12px;color:#d4d4d4;margin-top:6px;">10% off your next campus order (min ₦10,000)</div>
      </div>

      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/shop" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Shop Latest Drops &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `You're on the VIP Drop List! 🏷️`,
      badgeText: "VIP Member",
      badgeColor: "#000000",
      bodyContent,
      footerNote: `You received this email because you subscribed on dripplug.com.ng. Reply to this email if you ever want to unsubscribe.`,
    });

    await sendEmail({
      to: email,
      subject: `Welcome to the Dripplug VIP Club! Here is 10% off 🏷️`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendNewsletterWelcomeEmail:", err);
  }
}

/* =======================================================================
   8. EVENT: ROLE UPGRADE (PROMOTED TO ADMIN) -> USER NOTIFICATION
   ======================================================================= */
export async function sendAdminRolePromotionEmail(
  user: { email: string; name?: string },
  assignedByAdminEmail?: string
): Promise<void> {
  try {
    const bodyContent = `
      <p style="font-size:15px;line-height:1.6;color:#333333;margin:0 0 16px;">
        Hi <strong>${user.name || user.email}</strong>,<br/>
        Your account on ${APP_NAME} has been granted <strong>Administrator Privileges</strong>${
          assignedByAdminEmail ? ` by ${assignedByAdminEmail}` : ""
        }.
      </p>

      <div style="background:#f0eeed;padding:16px;border-radius:12px;margin:18px 0;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#525252;margin-bottom:6px;">
          Admin Access Capabilities
        </div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#333333;line-height:1.8;">
          <li>Review real-time campus orders and manage fulfillment status.</li>
          <li>Receive incoming order alerts and inventory low stock warnings.</li>
          <li>Update catalog products, variants, categories, and discount coupons.</li>
          <li>Moderate customer verified reviews and user roles.</li>
        </ul>
      </div>

      <div style="margin:28px 0 12px;text-align:center;">
        <a href="${APP_URL}/admin" style="display:inline-block;padding:14px 28px;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:30px;letter-spacing:0.5px;">
          Access Admin Dashboard &rarr;
        </a>
      </div>
    `;

    const html = wrapEmailTemplate({
      headline: `Admin Access Granted`,
      badgeText: "Admin Role Assigned",
      badgeColor: "#000000",
      bodyContent,
      footerNote: `Please maintain security of your account credentials at all times.`,
    });

    await sendEmail({
      to: user.email,
      subject: `Admin Privileges Granted on ${APP_NAME}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed in sendAdminRolePromotionEmail:", err);
  }
}
