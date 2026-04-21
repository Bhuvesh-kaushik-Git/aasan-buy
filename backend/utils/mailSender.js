const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Default to gmail, can be configured in .env
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"AasanBuy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to AasanBuy! 🎁 Your Special Discount Awaits',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #1A237E; padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -1px;">AASAN<span style="color: #ffbc00;">BUY</span></h1>
          </div>
          <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Welcome to the AasanBuy family! We're thrilled to have you with us.
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              To make your first experience even more special, we've credited a private coupon to your account:
            </p>
            <div style="background-color: #f8f9fa; border: 2px dashed #ffbc00; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
              <span style="display: block; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Use Code</span>
              <span style="font-size: 28px; font-weight: 900; color: #1A237E; letter-spacing: 2px;">NEWUSER10</span>
              <span style="display: block; font-size: 14px; color: #ffbc00; font-weight: bold; margin-top: 5px;">10% OFF ON ALL PRODUCTS</span>
            </div>
            <p style="color: #666; font-size: 14px; font-style: italic;">
              *This coupon is valid exclusively for your account. Please ensure you are logged in to apply it at checkout.
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #1A237E; color: #ffffff; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 20px;">Start Shopping</a>
          </div>
          <div style="background-color: #fcfcfc; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
             <p style="color: #999; font-size: 12px; margin: 0;">AasanBuy since 2026</p>
             <p style="color: #ccc; font-size: 11px; margin-top: 5px;">Excellence Curated. Delivered with Love.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

module.exports = { sendWelcomeEmail };
