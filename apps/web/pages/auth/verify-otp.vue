<template>
    <div>
        <form @submit.prevent="verifyEmail">
            <input type="number" v-model="otp" placeholder="Enter OTP" />
            <button type="submit">Verify</button>
        </form>
    </div>
</template>
<script lang="ts" setup>
const { $client } = useNuxtApp()
const store = useFormDataStore()
const router = useRouter()

const otp = useState('otp', () => '')

onBeforeMount(() => {
    if (!store.signup) {
        router.push('/auth/signup')
    }
})

const verifyEmail = async () => {
    try {
        const { message } = await $client.auth.verifyEmail.mutate({
            otp: Number(otp.value),
            email: store.signup!.email
        })

        //toast(message)
        router.push('/auth/login')
    } catch (err) {
        console.log(err);

    }
}
</script>