<template>
  <div class="w-full max-w-md animate-slide-up">
    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-10 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
          <HeartIcon class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-white">{{ platformName }}</h1>
        <p class="text-indigo-100 mt-1 text-sm">{{ $t('app.tagline') }}</p>
      </div>

      <!-- Form -->
      <div class="px-8 py-8">
        <h2 class="text-xl font-bold text-gray-900 mb-1">{{ $t('auth.welcome_back') }}</h2>
        <p class="text-sm text-gray-500 mb-6">{{ $t('auth.sign_in_description') }}</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username -->
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

          <!-- Password -->
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
                <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                <EyeSlashIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Error -->
          <Transition name="fade">
            <div v-if="error" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <ExclamationCircleIcon class="w-4 h-4 shrink-0" />
              {{ error }}
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-primary w-full py-3 text-base"
            :disabled="loading"
          >
            <ArrowPathIcon v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? $t('auth.logging_in') : $t('auth.login_button') }}</span>
          </button>
        </form>

        <!-- LDAP note -->
        <p class="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <BuildingOfficeIcon class="w-3.5 h-3.5" />
          {{ $t('auth.corporate_login') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  HeartIcon, UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  ExclamationCircleIcon, ArrowPathIcon, BuildingOfficeIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore }     from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const router     = useRouter()
const route      = useRoute()
const { locale } = useI18n()
const authStore  = useAuthStore()
const settings   = useSettingsStore()

const form         = ref({ username: '', password: '' })
const showPassword = ref(false)
const loading      = computed(() => authStore.loading)
const error        = computed(() => authStore.error)
const platformName = computed(() => locale.value === 'ar' ? settings.settings.platform_name_ar : settings.settings.platform_name_en)

async function handleLogin() {
  await authStore.login(form.value)
  const redirect = route.query.redirect || '/dashboard'
  router.push(redirect)
}
</script>
