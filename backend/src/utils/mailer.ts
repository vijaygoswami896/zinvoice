import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,        // false for port 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Your Zinvoice OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #1a1a1a; margin-bottom: 4px;">Zinvoice</h2>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />

                <p style="color: #374151;">You requested a password reset. Use the OTP below:</p>

                <div style="text-align: center; margin: 32px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
                </div>

                <p style="color: #374151;">This OTP is valid for <strong>10 minutes</strong> and can only be used once.</p>
                <p style="color: #374151;">Do not share this code with anyone.</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

                <p style="color: #9ca3af; font-size: 12px;">If you did not request this, you can safely ignore this email. Your account remains secure.</p>
                <p style="color: #9ca3af; font-size: 12px;">— The Zinvoice Team</p>
            </div>
        `,
    });
}