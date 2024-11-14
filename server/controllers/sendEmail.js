const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, text, html) => {
  try {
    console.log(`Initiating email send to: ${to}`);
    console.log(`Creating transport with host: ${process.env.EMAIL_HOST}, port: ${process.env.EMAIL_PORT}`);
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Transport created successfully');
    console.log(`Preparing mail options with subject: ${subject}`);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    console.log('Mail options prepared, attempting to send...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully. MessageId: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log('Full send info:', JSON.stringify(info, null, 2));
    
    return info;
  } catch (error) {
    console.error('Detailed error information:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code,
      errorResponse: error.response
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = { sendEmail };