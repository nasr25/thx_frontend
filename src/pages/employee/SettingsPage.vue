<template>
  <div class="space-y-6 animate-fade-in max-w-2xl">
    <div class="page-header">
      <h1 class="page-title">{{ $t('settings.title') }}</h1>
    </div>

    <!-- Language preference -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-4">{{ $t('settings.language') }}</h2>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
          class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
          :class="currentLang === lang.code
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
            : 'border-gray-100 hover:border-gray-200 text-gray-600'"
        >
          <span class="text-2xl">{{ lang.flag }}</span>
          <div class="text-start">
            <p class="font-medium text-sm">{{ lang.label }}</p>
            <p class="text-xs opacity-60">{{ lang.direction }}</p>
          </div>
          <CheckCircleIcon v-if="currentLang === lang.code" class="w-5 h-5 ms-auto text-indigo-600" />
        </button>
      </div>
    </div>

    <!-- Profile info (read-only from AD) -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-4">Profile Information</h2>
      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-2 text-sm py-2 border-b border-gray-50">
          <span class="text-gray-500">Full Name</span>
          <span class="col-span-2 font-medium text-gray-900">{{ user?.full_name }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-sm py-2 border-b border-gray-50">
          <span class="text-gray-500">Username</span>
          <span class="col-span-2 font-medium text-gray-900">{{ user?.username }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-sm py-2 border-b border-gray-50">
          <span class="text-gray-500">Email</span>
          <span class="col-span-2 font-medium text-gray-900">{{ user?.email }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-sm py-2 border-b border-gray-50">
          <span class="text-gray-500">Department</span>
          <span class="col-span-2 font-medium text-gray-900">{{ user?.department?.name }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-sm py-2">
          <span class="text-gray-500">Job Title</span>
          <span class="col-span-2 font-medium text-gray-900">{{ user?.job_title }}</span>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-4 flex items-center gap-1">
        <LockClosedIcon class="w-3.5 h-3.5" />
        Profile data is managed by your IT department
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const authStore  = useAuthStore()

const user        = computed(() => authStore.user)
const currentLang = computed(() => locale.value)

const languages = [
  { code: 'en', label: 'English',  flag: '🇬🇧', direction: 'Left-to-Right (LTR)' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', direction: 'Right-to-Left (RTL)' },
]

async function selectLanguage(lang) {
  locale.value = lang
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
  localStorage.setItem('preferred_language', lang)
  await authStore.updateLanguage(lang)
}
</script>
