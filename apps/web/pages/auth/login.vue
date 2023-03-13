<template>
    <div>
        <form @submit.prevent="login">
            <input type="text" placeholder="Enter your username or email" v-model.trim="formData.identifier" />
            <input type="password" placeholder="Enter your password" v-model="formData.password" />
            <button type="submit">Login</button>
        </form>
    </div>
</template>
<script lang="ts" setup>
const authStore = useAuthStore()
const formData = useState('formData', () => ({ identifier: '', password: '' }))

const login = async () => {
    await authStore.login(formData.value)
}
</script>