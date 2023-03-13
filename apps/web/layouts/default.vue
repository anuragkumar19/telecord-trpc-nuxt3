<template>
    <div>
        <slot />
        <Toast v-for="msg in messages" :message="msg.message" :key="msg.id" />
    </div>
</template>
<script setup lang="ts">
const messages = useState<{ id: number, message: string }[]>("toastMessages", () => [])

const showToast = (message: string, forXMilliSeconds = 5000) => {
    const id = Date.now()

    messages.value.push({ id, message })
    setTimeout(() => {
        messages.value = messages.value.filter(m => m.id === id)
    }, forXMilliSeconds)
}

provide("toast", { showToast })
</script>