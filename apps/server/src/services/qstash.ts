import { Client, Receiver } from '@upstash/qstash'

export const client = new Client({
    token: process.env.QSTASH_TOKEN!,
})

export const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
})
