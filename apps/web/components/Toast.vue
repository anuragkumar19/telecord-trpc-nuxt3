<template>
    <div class="toast">
        <div class="alert alert-info">
            <div>
                <span>{{ props.message }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
    message: string
}>()
</script>