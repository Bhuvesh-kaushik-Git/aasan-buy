const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || '"AasanBuy" <noreply@aasanbuy.com>';

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email] SMTP not configured – skipping: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error('[Email] Send error:', err.message);
  }
};

/**
 * Send order confirmation email after a successful order.
 */
exports.sendOrderConfirmation = async (order) => {
  const itemRows = (order.items || [])
    .map(
      (i) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #f0f0f0">${i.name}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center">×${i.quantity}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${i.price * i.quantity}</td></tr>`
    )
    .join('');

  await sendEmail({
    to: order.customerDetails.email,
    subject: `✅ Order Confirmed – #${order._id.toString().slice(-6).toUpperCase()} | AasanBuy`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#1a1a2e">
        <div style="background:#3b1f6e;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#f59c1a;margin:0;font-size:24px">AasanBuy</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #f0f0f0;border-top:none">
          <h2 style="color:#3b1f6e;margin-top:0">Your order is confirmed! 🎉</h2>
          <p>Hi <strong>${order.customerDetails.fullName}</strong>, thank you for shopping with AasanBuy.</p>

          <table width="100%" style="border-collapse:collapse;margin:16px 0;background:#fafafa;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#f0ebff;font-size:12px;text-transform:uppercase;color:#3b1f6e">
                <th style="padding:10px 8px;text-align:left">Item</th>
                <th style="padding:10px 8px;text-align:center">Qty</th>
                <th style="padding:10px 8px;text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="font-weight:bold;font-size:15px">
                <td colspan="2" style="padding:12px 8px;text-align:right;color:#3b1f6e">Grand Total:</td>
                <td style="padding:12px 8px;text-align:right;color:#3b1f6e">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          ${order.couponCode ? `<p style="color:#16a34a">🏷 Coupon <strong>${order.couponCode}</strong> applied — you saved ₹${order.discountAmount}</p>` : ''}
          <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}</p>
          <p><strong>Shipping to:</strong> ${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} – ${order.customerDetails.pincode}</p>
          <p style="font-size:12px;color:#888;margin-top:24px">Order ID: <code>#${order._id}</code></p>
        </div>
        <div style="padding:16px 32px;background:#fafafa;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px;font-size:11px;color:#aaa">
          © 2026 AasanBuy. All rights reserved.
        </div>
      </div>`,
  });
};

/**
 * Send order status update email when admin changes status.
 */
exports.sendOrderStatusUpdate = async (order) => {
  const statusMessages = {
    Shipped:   '🚚 Your order is on its way!',
    Delivered: '🎁 Your order has been delivered. Enjoy!',
    Cancelled: '❌ Your order has been cancelled. Contact support if you have questions.',
  };
  const msg = statusMessages[order.orderStatus];
  if (!msg) return;

  await sendEmail({
    to: order.customerDetails.email,
    subject: `Order ${order.orderStatus} – #${order._id.toString().slice(-6).toUpperCase()} | AasanBuy`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#1a1a2e">
        <div style="background:#3b1f6e;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#f59c1a;margin:0;font-size:24px">AasanBuy</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#3b1f6e;margin-top:0">Order Status Update</h2>
          <p>Hi <strong>${order.customerDetails.fullName}</strong>,</p>
          <p style="font-size:16px;">${msg}</p>
          <p><strong>Order ID:</strong> <code>#${order._id}</code></p>
          <p style="font-size:11px;color:#aaa;margin-top:24px">© 2026 AasanBuy. All rights reserved.</p>
        </div>
      </div>`,
  });
};
