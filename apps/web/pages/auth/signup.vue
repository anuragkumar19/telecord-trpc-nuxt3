<template>
    <div class="w-full h-screen flex justify-center items-center px-4">
        <div class="card shadow-lg">
            <div class="card-body">
                <form @submit.prevent="submit">
                    <div class="form-control w-full mb-3">
                        <input class="input w-full input-bordered input-primary" type="text" placeholder="Enter your name"
                            v-model.trim="formData.name" autocomplete="name" />
                    </div>
                    <div class="form-control w-full mb-3">
                        <input class="input w-full input-bordered input-primary" type="email" placeholder="Enter your email"
                            v-model.trim="formData.email" autocomplete="email" />
                    </div>
                    <div class="form-control w-full mb-3">
                        <input class="input w-full input-bordered input-primary" type="text" placeholder="Choose a username"
                            v-model.trim="formData.username" />
                    </div>
                    <div class="form-control w-full mb-3">
                        <input class="input w-full input-bordered input-primary" type="password"
                            placeholder="Choose a password" v-model="formData.password" autocomplete="new-password" />
                    </div>

                    <button type="submit" class="btn btn-block">Sign Up</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { parseTRPCError } from '~~/parseTRPCError'

useHead({
    title: 'Welcome to Telecord - Signup - Telecord'
})


const store = useFormDataStore()
const router = useRouter()
const { $client } = useNuxtApp()

const formData = useState('formData', () => ({ email: '', name: '', username: '', password: '' }))
const message = useState('msg', () => '')
const $toast = inject<{ showToast: (message: string, forXMilliSeconds?: number) => void }>('toast')

const submit = async () => {
    // TODO: Client Side Validation...
    try {
        const data = await $client.auth.register.mutate(formData.value)
        message.value = data.message
        store.setSignUpData(formData.value)
        router.push('/auth/verify-otp')
    } catch (err) {
        const { message } = parseTRPCError(err)
        $toast?.showToast(message)
    }

}
</script>