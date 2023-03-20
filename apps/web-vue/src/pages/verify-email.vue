<template>
    <AuthLayout>
        <div class="card max-w-md w-full shadow-xl">
            <div class="card-body">
                <h2 class="text-center font-extrabold mb-3">Verify your email</h2>
                <p class="text-center">
                    An OTP is sent to your email <code>{{ registerData?.email }}</code>. Enter the OTP to activate your
                    account
                </p>
                <form @submit.prevent="handleEmailVerification">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">OTP</span>
                        </label>
                        <input min="100000" max="999999" type="number" placeholder="000000" autocomplete="off"
                            class="input input-bordered w-full" v-model="otp" />
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn variant-filled mt-4 w-full" :class="submitting ? 'loading' : ''"
                            :disabled="submitting">
                            Continue </button>
                    </div>
                </form>
                <p class="text-center mt-2">
                    <RouterLink to="/register">Back to register ></RouterLink>
                </p>
            </div>
        </div>
    </AuthLayout>
</template>
<script setup lang="ts">
import type { RegisterData } from '@/interfaces';
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ref } from 'vue';

let registerData: RegisterData

const otp = ref('')
const submitting = ref(false)


const handleEmailVerification = () => {

}
</script>