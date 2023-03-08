import jwt, { JwtPayload } from 'jsonwebtoken'
import { prisma } from '@telecord/db'
import { ControllerError } from '../error'
import { middleware } from '../trpc'

const getUserFromToken = async (token?: string) => {
    if (!token) {
        throw new ControllerError({
            message: 'No token provided',
            code: 'UNAUTHORIZED',
        })
    }

    const accessToken = token.split(' ')[1]

    if (!accessToken) {
        throw new ControllerError({
            message: 'Invalid token',
            code: 'UNAUTHORIZED',
        })
    }

    try {
        const payload = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        ) as JwtPayload

        const user = await prisma.user.findUnique({ where: { id: payload.id } })

        if (!user) {
            throw new ControllerError({
                message: 'Invalid token',
                code: 'UNAUTHORIZED',
            })
        }

        return user
    } catch (err) {
        throw new ControllerError({
            message: 'Invalid token',
            code: 'UNAUTHORIZED',
        })
    }
}

export const authGuardTRPC = middleware(async ({ ctx, next }) => {
    const token = ctx.req.headers.authorization

    const user = await getUserFromToken(token)

    return next({
        ctx: {
            ...ctx,
            user,
        },
    })
});
  

// export const verifyPassword: (schema?: Schema) => Handler =
//     (schema) => (req, res, next) => {
//         validate(schema ? schema : passwordVerifySchema)(req, res, () => {
//             const { password } = req.body

//             if (req.user!.comparePassword(password)) {
//                 return next()
//             }

//             res.status(401)
//             throw new Error('Invalid password')
//         })
//     }
