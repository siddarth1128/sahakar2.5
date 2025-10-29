const nodemailer = require('nodemailer');

/**
 * Create email transporter based on environment configuration
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Generate OTP email HTML template
 */
const generateOTPEmailTemplate = (name, otp, expirationMinutes = 10) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - FixItNow</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                        🔧 FixItNow
                                    </h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                        Professional Home Services
                                    </p>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                                        Hello ${name}! 👋
                                    </h2>

                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                        Thank you for signing up with FixItNow! To complete your registration and verify your email address, please use the One-Time Password (OTP) below:
                                    </p>

                                    <!-- OTP Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; display: inline-block;">
                                                    <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                                        Your OTP Code
                                                    </p>
                                                    <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                        ${otp}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                        This OTP will expire in <strong style="color: #667eea;">${expirationMinutes} minutes</strong>. Please do not share this code with anyone.
                                    </p>

                                    <!-- Warning Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                                    <strong>⚠️ Security Notice:</strong> If you didn't request this OTP, please ignore this email or contact our support team immediately.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                        Need help? Contact us at
                                        <a href="mailto:support@fixitnow.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@fixitnow.com</a>
                                    </p>
                                    <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">
                                        © ${new Date().getFullYear()} FixItNow. All rights reserved.
                                    </p>
                                    <div style="margin-top: 15px;">
                                        <a href="#" style="display: inline-block; margin: 0 5px; color: #667eea; text-decoration: none; font-size: 20px;">📘</a>
                                        <a href="#" style="display: inline-block; margin: 0 5px; color: #667eea; text-decoration: none; font-size: 20px;">🐦</a>
                                        <a href="#" style="display: inline-block; margin: 0 5px; color: #667eea; text-decoration: none; font-size: 20px;">📸</a>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

/**
 * Generate welcome email template
 */
const generateWelcomeEmailTemplate = (name) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to FixItNow</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                        🎉 Welcome to FixItNow!
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                                        Hi ${name}!
                                    </h2>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                        Your email has been successfully verified! Welcome to the FixItNow community.
                                    </p>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                        You can now access all our services and book professional home service providers.
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                                    Start Booking Services
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                        © ${new Date().getFullYear()} FixItNow. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

/**
 * Generate password reset email template
 */
const generatePasswordResetTemplate = (name, resetUrl) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - FixItNow</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                        🔐 Password Reset
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                                        Hi ${name}!
                                    </h2>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                        We received a request to reset your password. Click the button below to create a new password:
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                        This link will expire in 30 minutes.
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                                        © ${new Date().getFullYear()} FixItNow. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, name, otp) => {
    try {
        const transporter = createTransporter();
        const expirationMinutes = parseInt(process.env.OTP_EXPIRE) || 10;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"FixItNow" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - FixItNow',
            html: generateOTPEmailTemplate(name, otp, expirationMinutes),
            text: `Hello ${name}, Your OTP for email verification is: ${otp}. This OTP will expire in ${expirationMinutes} minutes.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error sending OTP email: ${error.message}`);
        throw new Error('Failed to send OTP email');
    }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"FixItNow" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to FixItNow!',
            html: generateWelcomeEmailTemplate(name),
            text: `Welcome to FixItNow, ${name}! Your email has been successfully verified.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error sending welcome email: ${error.message}`);
        throw new Error('Failed to send welcome email');
    }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"FixItNow" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your Password - FixItNow',
            html: generatePasswordResetTemplate(name, resetUrl),
            text: `Hello ${name}, Click this link to reset your password: ${resetUrl}. This link will expire in 30 minutes.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error sending password reset email: ${error.message}`);
        throw new Error('Failed to send password reset email');
    }
};

/**
 * Generic send email function
 */
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: options.from || process.env.EMAIL_FROM || `"FixItNow" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Error sending email: ${error.message}`);
        throw new Error('Failed to send email');
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendEmail
};
