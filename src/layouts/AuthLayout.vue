<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <div class="absolute top-4 end-4">
      <LanguageSwitcher />
    </div>
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')
</script>
