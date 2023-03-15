export const getRegisterOtpKey = (id: string) => `registerOtp:${id}`
export const getForgotPasswordOtpKey = (id: string) => `forgotPasswordOtp:${id}`
export const getSecondaryEmailOtpKey = (id: string) => `secondaryEmailOtp:${id}`
export const getRateLimitKey = (ip: string) => `rateLimit:${ip}`
export const getTempUploadKey = (publicId: string) => `tempUpload:${publicId}`
