import ejs from 'ejs'
import { createTransport } from 'nodemailer'
import path from 'path'
import {
    EmailSubject,
    EmailText,
    SendOtpType,
    __COMPANY_NAME__,
} from '../constants'

async function getTransporter() {
    let options = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    }

    return createTransport(options)
}

export const sendOtp = async (
    email: string,
    otp: number,
    type: SendOtpType
) => {
    const transporter = await getTransporter()

    let subject: string
    let text: string

    switch (type) {
        case 'VERIFY_EMAIL':
            subject = EmailSubject.VerifyEmail
            text = EmailText.VerifyEmail
            break
        case 'RESET_PASSWORD':
            subject = EmailSubject.ResetPassword
            text = EmailText.ResetPassword
            break
        case 'VERIFY_SECONDARY_EMAIL':
            subject = EmailSubject.VerifySecondaryEmail
            text = EmailSubject.VerifySecondaryEmail
            break
        default:
            subject = __COMPANY_NAME__ + ' - Your OTP'
            text = "Your Otp is here. Don't share"
            break
    }

    const html = await ejs.renderFile(
        path.join(path.resolve(), 'views', 'emails', 'otp.ejs'),
        { otp, text }
    )

    await transporter.sendMail({
        to: email,
        from: process.env.EMAIL,
        subject,
        html,
    })
}
