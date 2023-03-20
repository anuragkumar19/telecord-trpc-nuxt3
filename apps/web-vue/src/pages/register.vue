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
                        <input type="text" placeholder="John deo" autocomplete="name" class="input input-bordered w-full"
                            :class="errors.name ? 'input-error' : ''" v-model="name" />
                        <label class="label" v-if="errors.name">
                            <span class="label-text-alt text-error">{{ errors.name }}</span>
                        </label>
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Email</span>
                        </label>
                        <input type="text" placeholder="john@example.com" autocomplete="email"
                            class="input input-bordered w-full" :class="errors.email ? 'input-error' : ''"
                            v-model="email" />
                        <label class="label" v-if="errors.email">
                            <span class="label-text-alt text-error">{{ errors.email }}</span>
                        </label>
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Username</span>
                        </label>
                        <input type="text" placeholder="john_deo" autocomplete="off" class="input input-bordered w-full"
                            :class="errors.username ? 'input-error' : ''" v-model="username" />
                        <label class="label" v-if="errors.username">
                            <span class="label-text-alt text-error">{{ errors.username }}</span>
                        </label>
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">Password</span>
                        </label>
                        <input type="password" placeholder="*********" autocomplete="new-password"
                            class="input input-bordered w-full" :class="errors.password ? 'input-error' : ''"
                            v-model="password" />
                        <label class="label" v-if="errors.password">
                            <span class="label-text-alt text-error">{{ errors.password }}</span>
                        </label>
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
import { trpc } from '@/lib/trpc'
import { registerSchema, ZodError } from '@telecord/server/src/schema/zod'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { reactive, ref } from 'vue';
import { useToast } from 'vue-toast-notification';

const name = ref('')
const email = ref('')
const username = ref('')
const password = ref('')
const submitting = ref(false)

const initialErrors = {
    name: '',
    email: '',
    username: "",
    password: ""
}

let errors = reactive(initialErrors)

const $toast = useToast();

const handleRegister = async () => {
    try {
        submitting.value = true
        const data = registerSchema.parse({
            name: name.value,
            email: email.value,
            username: username.value,
            password: password.value,
        })

        errors = initialErrors

        const { message } = await trpc.auth.register.mutate(data)

        $toast.success(message)
    } catch (err) {
        if (err instanceof ZodError) {
            const fieldErrors = err.flatten().fieldErrors

            Object.keys(fieldErrors).forEach(key => {
                const message = !fieldErrors[key] ? '' : fieldErrors[key]![0]
                errors[key] = message
            })
        }
    } finally {
        submitting.value = false
    }

}
</script>