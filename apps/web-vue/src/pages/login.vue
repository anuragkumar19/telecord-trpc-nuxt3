<template>
	<AuthLayout>
		<div class="card max-w-md w-full shadow-xl">
			<div class="card-body">
				<h2 class="text-center font-extrabold mb-3">Welcome back! Login</h2>
				<form @submit.prevent="handleLogin">
					<div class="form-control w-full">
						<label class="label">
							<span class="label-text">Email or Username</span>
						</label>
						<input type="text" placeholder="john_Deo" autocomplete="username"
							class="input input-bordered w-full" v-model="identifier" />
					</div>
					<div class="form-control w-full">
						<label class="label">
							<span class="label-text">Password</span>
						</label>
						<input type="password" placeholder="*********" autocomplete="current-password"
							class="input input-bordered w-full" v-model="password" />
					</div>
					<div class="text-center">
						<button type="submit" class="btn variant-filled mt-4 w-full" :class="submitting ? 'loading' : ''"
							:disabled="submitting">
							Login </button>
					</div>
				</form>
				<p class="text-center mt-2">
					<RouterLink to="/forgot-password">Forgot your password?</RouterLink>
				</p>
				<p class="text-center mt-2">
					<RouterLink to="/register">Don't have an account?</RouterLink>
				</p>
			</div>
		</div>
	</AuthLayout>
</template>
<script setup lang="ts">
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ref } from 'vue';


const identifier = ref('')
const password = ref('')
const submitting = ref(false)

const handleLogin = () => {

}
</script>