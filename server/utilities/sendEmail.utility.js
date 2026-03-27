const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If no SMTP credentials, just log it (Dev Mode)
  if (!process.env.SMTP_HOST) {
    console.log("-----------------------------------------");
    console.log(`[MOCK EMAIL] To: ${options.email}`);
    console.log(`[MOCK EMAIL] Subject: ${options.subject}`);
    console.log(`[MOCK EMAIL] Message: \n${options.message}`);
    console.log("-----------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Wooffer'} <${process.env.FROM_EMAIL || 'no-reply@wooffer.io'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
