import { WhoCanSee, WhoCanSend } from '@telecord/db'
import { z, ZodError as _ZodError } from 'zod'
import { UploadTypes } from '../constants'

export const ZodError = _ZodError

const zodString = (field: string) =>
    z.string({
        invalid_type_error: `${field} is invalid.`,
        required_error: `${field} is required`,
    })

const name = zodString('name')
    .trim()
    .nonempty({ message: 'Name cannot be empty' })

const email = zodString('email')
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email' })

const username = zodString('username')
    .trim()
    .toLowerCase()
    .min(3, { message: 'Username must be at least 3 character long' })
    .max(50, { message: 'Username cannot exceed 50 character' })
    .regex(
        /^[a-zA-Z0-9_.]+$/i,
        'Username must contain only letters, numbers, periods(.) & underscores(_)'
    )
    .refine((arg) => /[a-zA-Z]/.test(arg.charAt(0)), {
        message:
            'Username cannot start with number periods(.) or underscores(_)',
    })

// TODO: Password can have maximum 72 bytes. Zod currently doesn't support counting length in bytes/neither does ECMAScript natively. We can do some trick (Ref:https://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript). Currently fixing the max length to 60 char.
const newPassword = zodString('password')
    .min(8, { message: 'Password must be at least 8 character long' })
    .max(60, { message: 'Password cannot exceed 60 character' })

const password = zodString('password').nonempty({
    message: 'Password cannot be empty',
})

const otp = z
    .number()
    .min(100000, { message: 'Invalid OTP' })
    .max(999999, { message: 'Invalid OTP' })

const whoCanSee = z
    .nativeEnum(WhoCanSee, { invalid_type_error: 'Invalid Value' })
    .optional()
const whoCanSend = z
    .nativeEnum(WhoCanSend, { invalid_type_error: 'Invalid Value' })
    .optional()

export const registerSchema = z.object({
    name,
    email,
    username,
    password: newPassword,
})

export const verifyEmailSchema = z.object({
    email,
    otp,
})

export const resetPasswordSchema = z.object({
    email,
    otp,
    password: newPassword,
})

export const forgotPasswordSchema = z.object({
    email,
})

export const loginSchema = z.object({
    identifier: email.or(username),
    password,
})

export const refreshTokenSchema = z.object({
    refreshToken: zodString('refreshToken').nonempty(),
})

export const updateNameSchema = z.object({
    name,
})

export const updateUsernameSchema = z.object({
    username,
})

export const secondaryEmailSchema = z.object({
    email,
})

export const updatePasswordSchema = z.object({
    oldPassword: password,
    newPassword: newPassword,
})

export const updateBioSchema = z.object({
    bio: zodString('bio').max(200, {
        message: ' Bio cannot exceed 200 characters',
    }),
})

export const verifySecondaryEmailSchema = z.object({
    otp,
})

export const accountPrivacySchema = z.object({
    whoCanSeeBio: whoCanSee,
    whoCanSeeActiveStatus: whoCanSee,
    whoCanSeeAvatar: whoCanSee,
    whoCanSeeLastSeen: whoCanSee,
    whoCanSeeStatus: whoCanSee,
    whoCanSendYouMessage: whoCanSend,
})

export const idOnlySchema = z.object({
    id: zodString('id').nonempty(),
})

export const withPaginationSchema = z.object({
    cursor: zodString('cursor').optional(),
    limit: z.number(),
})

export const searchUserSchema = withPaginationSchema.extend({
    query: zodString('query'),
})
export const getUploadCredentialsSchema = z.object({
    type: z.enum(UploadTypes, { invalid_type_error: 'Invalid Value' }),
})

export const publicIdOnlySchema = z.object({
    publicId: zodString('publicId').nonempty({
        message: 'Public Id cannot be empty',
    }),
})

export const createStatusSchema = publicIdOnlySchema.extend({
    caption: zodString('caption')
        .trim()
        .max(500, { message: 'Caption cannot be longer than 500 characters' })
        .optional(),
})
