import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderEmailParams = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  state: string;
  city: string;
  items: { name: string; quantity: number; subtotal: number }[];
  deliveryFee: number;
  totalAmount: number;
};

function emailWrapper(title: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#241509;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#3a2415;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <div style="background:#e8a23a;padding:24px 32px;">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#241509;letter-spacing:0.05em;text-transform:uppercase;">
              Crispy Munchies 🍌
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:#241509;opacity:0.75;">${title}</p>
          </div>
          <!-- Body -->
          <div style="padding:32px;">
            ${body}
          </div>
          <!-- Footer -->
          <div style="padding:16px 32px;border-top:1px solid rgba(246,236,219,0.1);">
            <p style="margin:0;font-size:11px;color:rgba(246,236,219,0.4);text-align:center;">
              Crispy Munchies · Minna, Niger State · +234-8033377084
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function itemsTable(
  items: { name: string; quantity: number; subtotal: number }[]
): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);padding-bottom:8px;">Item</td>
          <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);padding-bottom:8px;text-align:center;">Qty</td>
          <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);padding-bottom:8px;text-align:right;">Amount</td>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#f6ecdb;border-top:1px solid rgba(246,236,219,0.1);">${item.name}</td>
            <td style="padding:8px 0;font-size:14px;color:#f6ecdb;text-align:center;border-top:1px solid rgba(246,236,219,0.1);">${item.quantity}</td>
            <td style="padding:8px 0;font-size:14px;color:#e8a23a;font-weight:bold;text-align:right;border-top:1px solid rgba(246,236,219,0.1);">₦${item.subtotal.toLocaleString()}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

export async function sendCustomerConfirmationEmail(
  toEmail: string,
  params: OrderEmailParams
) {
  const body = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#f6ecdb;">
      Order confirmed! 🎉
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:rgba(246,236,219,0.7);line-height:1.6;">
      Hi ${params.customerName}, we've received your payment and we're already
      getting your order ready. Here's a summary:
    </p>

    <div style="background:rgba(36,21,9,0.5);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);">Order number</p>
      <p style="margin:0;font-size:16px;font-weight:bold;color:#e8a23a;">${params.orderNumber}</p>
    </div>

    ${itemsTable(params.items)}

    <div style="border-top:1px solid rgba(246,236,219,0.15);padding-top:12px;margin-top:4px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:13px;color:rgba(246,236,219,0.6);">Delivery fee</span>
        <span style="font-size:13px;color:rgba(246,236,219,0.6);">₦${params.deliveryFee.toLocaleString()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:15px;font-weight:bold;color:#f6ecdb;">Total paid</span>
        <span style="font-size:15px;font-weight:bold;color:#e8a23a;">₦${params.totalAmount.toLocaleString()}</span>
      </div>
    </div>

    <div style="background:rgba(36,21,9,0.5);border-radius:10px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);">Delivering to</p>
      <p style="margin:0;font-size:14px;color:#f6ecdb;line-height:1.6;">
        ${params.address}<br/>${params.city}, ${params.state}
      </p>
    </div>

    <a href="https://wa.me/2348033377084?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20order%20${params.orderNumber}"
      style="display:block;margin-top:24px;background:#9cb52c;color:#241509;text-align:center;padding:14px;border-radius:50px;font-size:13px;font-weight:bold;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
      💬 Questions? Chat us on WhatsApp
    </a>
  `;

  return resend.emails.send({
    from: "Crispy Munchies <onboarding@resend.dev>",
    to: toEmail,
    subject: `Order confirmed — ${params.orderNumber}`,
    html: emailWrapper("Order Confirmation", body),
  });
}

export async function sendOwnerNotificationEmail(
  params: OrderEmailParams
) {
  const ownerEmail = process.env.OWNER_EMAIL!;

  const body = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#f6ecdb;">
      New order received 🛍️
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:rgba(246,236,219,0.7);">
      A new order just came in and payment has been confirmed.
    </p>

    <div style="background:rgba(36,21,9,0.5);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);">Order number</p>
      <p style="margin:0;font-size:16px;font-weight:bold;color:#e8a23a;">${params.orderNumber}</p>
    </div>

    <div style="background:rgba(36,21,9,0.5);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(246,236,219,0.5);">Customer details</p>
      <p style="margin:0;font-size:14px;color:#f6ecdb;line-height:1.8;">
        <strong>${params.customerName}</strong><br/>
        📞 ${params.customerPhone}<br/>
        📍 ${params.address}, ${params.city}, ${params.state}
      </p>
    </div>

    ${itemsTable(params.items)}

    <div style="border-top:1px solid rgba(246,236,219,0.15);padding-top:12px;margin-top:4px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:13px;color:rgba(246,236,219,0.6);">Delivery fee</span>
        <span style="font-size:13px;color:rgba(246,236,219,0.6);">₦${params.deliveryFee.toLocaleString()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:15px;font-weight:bold;color:#f6ecdb;">Total received</span>
        <span style="font-size:15px;font-weight:bold;color:#e8a23a;">₦${params.totalAmount.toLocaleString()}</span>
      </div>
    </div>

    <a href="https://wa.me/${params.customerPhone.replace(/[^0-9]/g, "")}"
      style="display:block;margin-top:24px;background:#9cb52c;color:#241509;text-align:center;padding:14px;border-radius:50px;font-size:13px;font-weight:bold;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">
      💬 WhatsApp the customer
    </a>

    <a href="${process.env.NEXTAUTH_URL}/admin/orders"
      style="display:block;margin-top:12px;background:rgba(232,162,58,0.15);color:#e8a23a;text-align:center;padding:14px;border-radius:50px;font-size:13px;font-weight:bold;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(232,162,58,0.3);">
      View in dashboard →
    </a>
  `;

  return resend.emails.send({
    from: "Crispy Munchies <onboarding@resend.dev>",
    to: ownerEmail,
    subject: `New order — ${params.orderNumber} · ₦${params.totalAmount.toLocaleString()}`,
    html: emailWrapper("New Order Notification", body),
  });
}