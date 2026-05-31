<template>
  <div class="w-full max-w-md animate-slide-up">
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 px-8 py-10 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
          <ShieldCheckIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-xl font-bold text-white">{{ platformName }}</h1>
        <p class="text-gray-400 mt-1 text-sm">Administrator Access</p>
      </div>

      <!-- Form -->
      <div class="px-8 py-8">
        <h2 class="text-lg font-bold text-gray-900 mb-1">Admin Sign In</h2>
        <p class="text-sm text-gray-500 mb-6">Enter your administrator credentials</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="label">{{ $t('auth.username') }}</label>
            <div class="relative">
              <UserIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.username"
                type="text"
                class="input ps-10"
                :placeholder="$t('auth.username_placeholder')"
                autocomplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label class="label">{{ $t('auth.password') }}</label>
            <div class="relative">
              <LockClosedIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input ps-10 pe-10"
                :placeholder="$t('auth.password_placeholder')"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Error -->
          <Transition name="fade">
            <div v-if="errorMsg" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <ExclamationCircleIcon class="w-4 h-4 shrink-0" />
              {{ errorMsg }}
            </div>
          </Transition>

          <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
            <ArrowPathIcon v-if="loading" class="w-4 h-4 animate-spin" />
            {{ loading ? $t('auth.logging_in') : $t('auth.login_button') }}
          </button>
        </form>

        <!-- Note about employee auth -->
        <div class="mt-6 p-3 bg-blue-50 rounded-xl text-xs text-blue-600">
          <InformationCircleIcon class="w-4 h-4 inline me-1" />
          Employees sign in automatically via Windows Authentication — no login form required.
        </div>
      </div>
    </div>

    <!-- Language switcher -->
    <div class="mt-4 flex justify-center">
      <LanguageSwitcher />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ShieldCheckIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  ExclamationCircleIcon, ArrowPathIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useAuthStore }     from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const router     = useRouter()
const { locale } = useI18n()
const authStore  = useAuthStore()
const settings   = useSettingsStore()

const form         = ref({ username: '', password: '' })
const showPassword = ref(false)
const loading      = computed(() => authStore.loading)
const errorMsg     = computed(() => authStore.error)
const platformName = computed(() => locale.value === 'ar' ? settings.settings.platform_name_ar : settings.settings.platform_name_en)

async function handleLogin() {
  try {
    await authStore.adminLogin(form.value)
    router.push('/admin/dashboard')
  } catch {
    // error already set in store
  }
}
</script>
