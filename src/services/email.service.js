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

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to take messages');
    }
});

// Send email
export const sendEmail = async ({ email, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `Your Name <${config.GOOGLE_USER}>`,
            to: email,
            subject,
            text,
            html
        });

        console.log('Email sent:', info.messageId);

        return info;

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};