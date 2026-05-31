<template>
  <div class="flex items-center justify-center" :class="fullscreen ? 'fixed inset-0 bg-white/80 z-50' : 'py-12'">
    <div class="text-center">
      <div
        class="inline-block rounded-full border-4 border-indigo-100 animate-spin"
        :class="sizeClass"
        style="border-top-color: #6366f1"
      />
      <p v-if="text" class="mt-3 text-sm text-gray-500">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: String, default: 'md' },
  text: String,
  fullscreen: Boolean,
})

const sizeClass = computed(() => ({
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
}[props.size]))
</script>
