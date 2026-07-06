import nodemailer from 'nodemailer';

/**
 * Utility to send emails via SMTP or console mock backup.
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
  const isMailConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'your_smtp_user';

  if (isMailConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'VKS Marketing'}" <${process.env.SMTP_FROM || 'noreply@vksmarketing.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to: ${options.email}`);
      return;
    } catch (error) {
      console.error('Nodemailer SMTP Error:', error);
      // Fall through to logging the email for local developer debugging
    }
  }

  // Developer Mock Log Backup
  console.log('\n--- [DEVELOPER MOCK EMAIL LOG] ---');
  console.log(`To:      ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.message}`);
  if (options.html) {
    console.log(`HTML:    Included (Length: ${options.html.length} chars)`);
  }
  console.log('----------------------------------\n');
};

export default sendEmail;
