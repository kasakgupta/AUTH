import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    }
});


//verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to take messages');
    }
});

// Function to send an email
export const sendEmail = (to, subject, text, html) => {
    try {
        const info = transporter.sendMail({
            from: `Your Name <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent: ' + info.messageId);
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('Error sending email:', error);
    }
}