import { defineStore } from 'pinia'

export const useFormDataStore = defineStore('fromData', {
    state: () => ({
        signup: null as null | {
            email: string
            name: string
            username: string
            password: string
        },
    }),
    actions: {
        setSignUpData(data: {
            email: string
            name: string
            username: string
            password: string
        }) {
            this.signup = data
        },
    },
})
