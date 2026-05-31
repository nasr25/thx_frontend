<template>
  <div class="card">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-3xl font-bold text-gray-900">{{ value.toLocaleString() }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ label }}</p>
        <p v-if="subtitle" class="text-xs text-gray-400">{{ subtitle }}</p>
      </div>
      <span class="text-2xl">{{ icon }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: Number, default: 0 },
  label: String,
  subtitle: String,
  icon: String,
  color: String,
})
</script>
