const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');

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

const sendEmail = async ({ to, subject, template, data }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email] SMTP not configured – skipping: "${subject}"`);
    return;
  }
  try {
    // Render HTML from Pug template
    const html = pug.renderFile(path.join(__dirname, `../emails/${template}.pug`), data);

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
  await sendEmail({
    to: order.customerDetails.email,
    subject: `✅ Order Confirmed – #${order._id.toString().slice(-6).toUpperCase()} | AasanBuy`,
    template: 'orderConfirmation',
    data: {
      subject: 'Order Confirmed',
      order
    }
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
    template: 'orderStatus',
    data: {
      subject: 'Order Status Update',
      name: order.customerDetails.fullName,
      statusMessage: msg,
      orderId: order._id
    }
  });
};

/**
 * Send welcome email on new user registration.
 */
exports.sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to AasanBuy! 🎉',
    template: 'welcome',
    data: {
      subject: 'Welcome to AasanBuy!',
      name: user.name
    }
  });
};
