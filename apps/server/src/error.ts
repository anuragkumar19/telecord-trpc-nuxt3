import { TRPCError } from '@trpc/server'
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/dist/rpc'

type ErrorFormat = {
    message: string | undefined
    code: TRPC_ERROR_CODE_KEY
    cause?: {
        field: string
    }
}

export class ControllerError extends TRPCError {
    constructor(e: ErrorFormat) {
        super(e)
    }
}
