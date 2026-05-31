<template>
  <ThemeApplier />
  <component :is="currentLayout" />
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore }     from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import ThemeApplier  from '@/components/common/ThemeApplier.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout    from '@/layouts/AuthLayout.vue'
import AdminLayout   from '@/layouts/AdminLayout.vue'

const { locale } = useI18n()
const route      = useRoute()
const router     = useRouter()
const authStore  = useAuthStore()
const settings   = useSettingsStore()

const currentLayout = computed(() => {
  const l = route.meta.layout
  if (l === 'admin') return AdminLayout
  if (l === 'auth')  return AuthLayout
  return DefaultLayout
})

onMounted(async () => {
  // Restore language first for instant render
  const savedLang = localStorage.getItem('preferred_language') || 'en'
  locale.value = savedLang
  applyDirection(savedLang)

  // Load public branding (no auth needed)
  settings.fetchPublicSettings()

  // Restore existing session from storage
  if (authStore.token) {
    if (!authStore.user) await authStore.fetchMe()
    // Session restored — router guard will allow navigation
    return
  }

  // No token — attempt Windows auto-login once (not on auth pages)
  const authPages = ['admin-login', 'authenticating']
  if (!authPages.includes(route.name)) {
    await attemptWindowsAuth()
  }
})

async function attemptWindowsAuth() {
  try {
    await authStore.windowsLogin()
    // Success — apply user language and let router handle the current route
    if (authStore.user?.preferred_language) {
      locale.value = authStore.user.preferred_language
      applyDirection(authStore.user.preferred_language)
    }
  } catch {
    // Failed — router guard will redirect to /authenticating
  }
}

watch(locale, (lang) => {
  applyDirection(lang)
  localStorage.setItem('preferred_language', lang)
})

function applyDirection(lang) {
  document.documentElement.lang = lang
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
}
</script>
