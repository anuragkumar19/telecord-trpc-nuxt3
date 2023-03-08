export const __PROD__ = process.env.NODE_ENV === 'production'
export const __COMPANY_NAME__ = 'Telecord'

export type SendOtpType =
    | 'VERIFY_EMAIL'
    | 'RESET_PASSWORD'
    | 'VERIFY_SECONDARY_EMAIL'

export const EmailSubject = {
    VerifyEmail: 'Verify your email to activate your account',
    ResetPassword: 'OTP for password reset request',
    VerifySecondaryEmail:
        'Verify your secondary email to keep your account safe',
}

export const EmailText = {
    VerifyEmail: `Thanks for choosing ${__COMPANY_NAME__}. Please signup with OTP to continue.`,
    ResetPassword:
        'A password request is received for this account. Use this OTP is to continue.',
    VerifySecondaryEmail: 'OTP for verification of secondary email.',
}
