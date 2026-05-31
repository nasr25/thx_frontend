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
  // 1. Restore saved language immediately (before auth, for faster render)
  const savedLang = localStorage.getItem('preferred_language') || 'en'
  locale.value = savedLang
  applyDirection(savedLang)

  // 2. Load platform settings (branding, colors)
  await settings.fetchPublicSettings()

  // 3. If already have a valid token in storage, restore the session
  if (authStore.token && !authStore.user) {
    await authStore.fetchMe()
  }

  // 4. If still not authenticated, attempt Windows Auto-Login
  //    This ONLY works when the app is served from IIS with Windows Auth enabled
  //    on the /api/auth/windows endpoint.
  if (!authStore.isAuthenticated) {
    await attemptWindowsAuth()
  }

  // 5. Apply user's language preference (may differ from saved)
  if (authStore.user?.preferred_language) {
    locale.value = authStore.user.preferred_language
    applyDirection(authStore.user.preferred_language)
  }
})

async function attemptWindowsAuth() {
  // Don't attempt Windows auth if visiting the admin login page
  if (route.name === 'admin-login') return

  try {
    await authStore.windowsLogin()

    // Redirect to originally requested page if coming from /authenticating
    const redirect = route.query.redirect
    if (redirect) {
      router.push(redirect)
    }
  } catch {
    // Windows Auth failed (off-domain, no IIS Windows Auth, etc.)
    // Admin routes will redirect to /admin/login automatically via router guard.
    // Employee routes show the "authenticating failed" state.
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
