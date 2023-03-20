<template>
    <AuthLayout>
        <div class="card max-w-md w-full shadow-xl">
            <div class="card-body">
                <h2 class="text-center font-extrabold mb-3">Forgot your password?</h2>
                <p class="text-center">Don't worry! Reset your password in few clicks</p>
                <form @submit.prevent="handleForgotPassword">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="john@example.com" autocomplete="email"
                            class="input input-bordered w-full" v-model="email" />
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn variant-filled mt-4 w-full" :class="submitting ? 'loading' : ''"
                            :disabled="submitting">
                            Continue </button>
                    </div>
                </form>
                <p class="text-center mt-2">
                    <RouterLink to="/login">Back to login ></RouterLink>
                </p>
            </div>
        </div>
    </AuthLayout>
</template>
<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ref } from 'vue';


const email = ref('')
const submitting = ref(false)


const handleForgotPassword = () => {

}
</script>