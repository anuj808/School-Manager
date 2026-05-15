// Notifications Service Mock
// In a real production environment, uncomment nodemailer code and provide SMTP credentials.
// const nodemailer = require('nodemailer');

exports.sendEmail = async (to, subject, html) => {
  // Simulating email send to avoid crashing without nodemailer installed
  console.log(`\n\x1b[36m=== 📧 EMAIL NOTIFICATION SENT ===\x1b[0m`);
  console.log(`\x1b[33mTo:\x1b[0m ${to}`);
  console.log(`\x1b[33mSubject:\x1b[0m ${subject}`);
  console.log(`\x1b[33mBody:\x1b[0m ${html.replace(/<[^>]*>?/gm, '')}`); // strip html for console
  console.log(`\x1b[36m===================================\x1b[0m\n`);

  /*
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: 'test', pass: 'test' }
  });
  await transporter.sendMail({ from: '"School ERP" <no-reply@schoolerp.com>', to, subject, html });
  */
};
