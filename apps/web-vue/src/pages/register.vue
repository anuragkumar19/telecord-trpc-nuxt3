<template>
    <AuthLayout>
        <div class="card max-w-md w-full shadow-xl">
            <div class="card-body">
                <h2 class="text-center font-extrabold mb-3">Create an account</h2>
                <form @submit.prevent="handleRegister">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Name</span>
                        </label>
                        <input type="email" placeholder="John deo" autocomplete="name" class="input input-bordered w-full"
                            v-model="name" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="john@example.com" autocomplete="email"
                            class="input input-bordered w-full" v-model="email" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Username</span>
                        </label>
                        <input type="email" placeholder="john_deo" autocomplete="username"
                            class="input input-bordered w-full" v-model="username" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Password</span>
                        </label>
                        <input type="password" placeholder="*********" autocomplete="new-password"
                            class="input input-bordered w-full" v-model="password" />
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn variant-filled mt-4 w-full" :class="submitting ? 'loading' : ''"
                            :disabled="submitting">
                            Continue
                        </button>
                    </div>
                </form>
                <p class="text-center mt-2">
                    <RouterLink to="/login">Already have an account?</RouterLink>
                </p>
            </div>
        </div>
    </AuthLayout>
</template>
<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ref } from 'vue';


const name = ref('')
const email = ref('')
const username = ref('')
const password = ref('')
const submitting = ref(false)

const handleRegister = () => {

}
</script>