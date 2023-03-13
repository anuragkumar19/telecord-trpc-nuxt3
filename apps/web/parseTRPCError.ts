import { TRPCClientError } from '@trpc/client'

export const parseTRPCError = (err: any) => {
    const isTRPCError = err instanceof TRPCClientError
    let message = isTRPCError ? err.message : 'Something went wrong.'

    return {
        isTRPCError,
        message,
    }
}
