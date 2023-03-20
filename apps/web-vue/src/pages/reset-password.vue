<template>
    <AuthLayout>
        <div class="card max-w-md w-full shadow-xl">
            <div class="card-body">
                <h2 class="text-center font-extrabold mb-3">Reset your password</h2>
                <p class="text-center">
                    An OTP is sent to your email <code>{{ email }}</code>. Enter the OTP to reset your
                    password
                </p>
                <form @submit.prevent="handleResetPassword">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">OTP</span>
                        </label>
                        <input min="100000" max="999999" type="number" placeholder="000000" autocomplete="off"
                            class="input input-bordered w-full" v-model="otp" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">New Password</span>
                        </label>
                        <input type="password" placeholder="*********" autocomplete="new-password"
                            class="input input-bordered w-full" v-model="password" />
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn variant-filled mt-4 w-full" :class="submitting ? 'loading' : ''"
                            :disabled="submitting">
                            Update Password </button>
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

let email: string

const otp = ref('')
const password = ref('')
const submitting = ref(false)


const handleResetPassword = () => {

}
</script>