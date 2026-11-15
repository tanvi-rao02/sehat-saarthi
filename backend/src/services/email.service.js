const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await createTransporter().sendMail({
    from: `"SehatSaarthi" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your SehatSaarthi account',
    html: `
      <div style="font-family:Arial;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0d9488">SehatSaarthi</h2>
        <p>Hi ${name}, please verify your email to get started:</p>
        <a href="${url}" style="display:inline-block;background:#0d9488;color:#fff;
          padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Verify My Email
        </a>
        <p style="color:#94a3b8;font-size:12px">Link expires in 24 hours.</p>
      </div>`,
  });
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  const info = await createTransporter().sendMail({
    from: `"SehatSaarthi" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your SehatSaarthi password',
    html: `
      <div style="font-family:Arial;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0d9488">SehatSaarthi</h2>
        <p>Hi ${name}, click below to reset your password:</p>
        <a href="${url}" style="display:inline-block;background:#ef4444;color:#fff;
          padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:12px">Link expires in 1 hour.</p>
      </div>`,
  });
  console.log('PASSWORD RESET EMAIL SENT:', info.messageId); 
};
