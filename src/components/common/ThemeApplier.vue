<template>
  <div style="display:none" aria-hidden="true" />
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

function applyTheme(primary, secondary) {
  const root = document.documentElement
  root.style.setProperty('--color-primary', primary || '#6366f1')
  root.style.setProperty('--color-secondary', secondary || '#f59e0b')

  // Generate shades programmatically using CSS custom properties
  const hex = primary || '#6366f1'
  root.style.setProperty('--color-primary-500', hex)
}

onMounted(() => {
  applyTheme(settingsStore.primaryColor, settingsStore.secondaryColor)
})

watch(
  () => [settingsStore.primaryColor, settingsStore.secondaryColor],
  ([primary, secondary]) => applyTheme(primary, secondary)
)
</script>
