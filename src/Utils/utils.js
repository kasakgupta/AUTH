export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function OtpHTML(otp) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Your OTP Code</title>

        <style>
            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                padding: 0;
                background-color: #f4f7fb;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                    Roboto, Helvetica, Arial, sans-serif;
                color: #1f2937;
            }

            .email-wrapper {
                width: 100%;
                padding: 40px 20px;
                background-color: #f4f7fb;
            }

            .email-container {
                max-width: 560px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            }

            .header {
                padding: 32px 30px;
                text-align: center;
                background: linear-gradient(
                    135deg,
                    #4f46e5,
                    #7c3aed
                );
                color: #ffffff;
            }

            .logo {
                width: 52px;
                height: 52px;
                margin: 0 auto 16px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.18);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 700;
            }

            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }

            .content {
                padding: 40px 35px;
                text-align: center;
            }

            .content h2 {
                margin: 0 0 12px;
                font-size: 22px;
                color: #111827;
            }

            .content p {
                margin: 0 0 24px;
                font-size: 15px;
                line-height: 1.7;
                color: #6b7280;
            }

            .otp-box {
                margin: 28px auto;
                padding: 20px;
                max-width: 320px;
                background: #f5f3ff;
                border: 1px solid #ddd6fe;
                border-radius: 12px;
            }

            .otp {
                font-size: 36px;
                font-weight: 800;
                letter-spacing: 10px;
                color: #4f46e5;
                margin-left: 10px;
            }

            .expiry {
                margin-top: 12px;
                font-size: 13px;
                color: #6b7280;
            }

            .security-note {
                margin-top: 30px;
                padding: 16px;
                background: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 10px;
                text-align: left;
            }

            .security-note strong {
                display: block;
                margin-bottom: 5px;
                color: #9a3412;
                font-size: 14px;
            }

            .security-note span {
                font-size: 13px;
                line-height: 1.5;
                color: #7c2d12;
            }

            .footer {
                padding: 24px 30px;
                text-align: center;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
            }

            .footer p {
                margin: 4px 0;
                font-size: 12px;
                color: #9ca3af;
                line-height: 1.5;
            }

           @media only screen and (max-width: 600px) {
                .email-wrapper {
                    padding: 20px 12px;
                }

                .content {
                    padding: 30px 20px;
                }

                .header {
                    padding: 28px 20px;
                }

                .otp {
                    font-size: 30px;
                    letter-spacing: 7px;
                }

                .content h2 {
                    font-size: 20px;
                }
            }
        </style>
    </head>

    <body>
        <div class="email-wrapper">

            <div class="email-container">

                <!-- Header -->
                <div class="header">
                    <div class="logo">✓</div>
                    <h1>Account Verification</h1>
                </div>

                <!-- Main Content -->
                <div class="content">

                    <h2>Your verification code</h2>

                    <p>
                        We received a request to verify your account.
                        Enter the following one-time password to continue.
                    </p>

                    <!-- OTP -->
                    <div class="otp-box">
                        <div class="otp">${otp}</div>

                        <div class="expiry">
                            This code is valid for a limited time.
                        </div>
                    </div>

                    <!-- Security Warning -->
                    <div class="security-note">
                        <strong>🔒 Keep your code secure</strong>
                        <span>
                            Never share this OTP with anyone. Our team will
                            never ask you for your verification code.
                        </span>
                    </div>

                </div>

                <!-- Footer -->
                <div class="footer">
                    <p>
                        If you didn't request this code, you can safely
                        ignore this email.
                    </p>

                    <p>
                        © ${new Date().getFullYear()} Your Company. All rights reserved.
                    </p>
                </div>

            </div>

        </div>
    </body>
    </html>
    `;
}  
