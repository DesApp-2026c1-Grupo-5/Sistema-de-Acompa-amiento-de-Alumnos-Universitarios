const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "SIVA <noreply@siva.com>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[mailer] Error al enviar email:", error.message);
  }
};

module.exports = { sendMail };
