import {
  APP_NAME,
  APP_URL,
  SUPPORT_EMAIL,
  WHATSAPP_NUMBER,
} from "@/config/site";
import { formatPrice } from "@/lib/format";
import { IOrder } from "@/models/Order";

/**
 * Fail-safe email abstraction using Resend HTTP API (or console log fallback in dev)
 * so email delivery errors never fail the Paystack webhook.
 */
export async function sendOrderConfirmationEmail(order: IOrder): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.EMAIL_FROM || `${APP_NAME} <orders@dripplug.com.ng>`;

    const itemsHtml = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;">
              <strong>${item.name}</strong><br/>
              <span style="color:#666;font-size:12px;">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:bold;">
              ${formatPrice(item.unitPrice * item.quantity)}
            </td>
          </tr>`
      )
      .join("");

    const addressExtra =
      order.deliveryAddress.hostel
        ? `<p style="margin:4px 0;font-size:13px;"><strong>Hostel:</strong> ${order.deliveryAddress.hostel}, Room ${order.deliveryAddress.room} (${order.deliveryAddress.landmark})</p>`
        : "";

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#000;background:#fff;border:1px solid #e5e5e5;border-radius:16px;">
        <h1 style="font-size:24px;text-transform:uppercase;letter-spacing:-0.5px;margin:0 0 8px;">${APP_NAME}</h1>
        <p style="font-size:14px;color:#666;margin:0 0 20px;">Order Confirmed &mdash; <strong>${order.orderNumber}</strong></p>
        <p style="font-size:14px;">Hi ${order.deliveryAddress.customerName}, your payment has been verified and we are preparing your campus drop-off.</p>
        <div style="background:#f0eeed;padding:14px;border-radius:12px;margin:16px 0;">
          <p style="margin:0 0 4px;font-size:13px;"><strong>Delivery Point:</strong> ${order.deliveryPoint.name} (${formatPrice(order.deliveryFee)})</p>
          ${addressExtra}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
          ${itemsHtml}
        </table>
        <p style="text-align:right;font-size:16px;font-weight:bold;">Total Paid: ${formatPrice(order.total)}</p>
        <p style="font-size:12px;color:#666;margin-top:24px;">
          Track your order at <a href="${APP_URL}/orders/${order.orderNumber}" style="color:#000;">${APP_URL}/orders/${order.orderNumber}</a> or message us on WhatsApp (+${WHATSAPP_NUMBER}) or ${SUPPORT_EMAIL}.
        </p>
      </div>
    `;

    if (!apiKey || apiKey === "re_your_resend_api_key") {
      console.log(
        `[Email Fallback] Order confirmation prepared for ${order.deliveryAddress.email} (${order.orderNumber})`
      );
      return;
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [order.deliveryAddress.email],
        subject: `Order Confirmed: ${order.orderNumber} | ${APP_NAME}`,
        html,
      }),
    });
  } catch (err) {
    console.error("[Email Warning]: Failed to send order confirmation email:", err);
  }
}
