const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const verifyConnection = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    logger.error("mailer", "Error de conexion SMTP", { error: error.message });
    return false;
  }
};

const sendMail = async ({ to, subject, html }, intentos = 3) => {
  for (let i = 1; i <= intentos; i++) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "SIVA UNAHUR <noreply@siva.com>",
        to,
        subject,
        html,
      });
      logger.info("mailer", "Email enviado", { to, subject, intento: i });
      return { success: true };
    } catch (error) {
      logger.error("mailer", `Intento ${i}/${intentos} fallido`, { to, subject, error: error.message });
      if (i === intentos) {
        return { success: false, error: error.message };
      }
    }
  }
};

module.exports = { sendMail, verifyConnection };
