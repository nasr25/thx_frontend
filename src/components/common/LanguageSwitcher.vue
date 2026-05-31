<template>
  <div class="relative">
    <button
      @click="toggle"
      class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      :title="$t('settings.language')"
    >
      <span class="text-lg">{{ currentFlag }}</span>
      <span class="hidden sm:inline">{{ currentLabel }}</span>
      <ChevronDownIcon class="w-4 h-4 opacity-60" />
    </button>

    <Transition name="fade">
      <div
        v-if="open"
        class="absolute top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[140px]"
        :class="isRtl ? 'left-0' : 'right-0'"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="select(lang.code)"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
          :class="{ 'text-indigo-600 font-medium bg-indigo-50': locale === lang.code }"
        >
          <span class="text-lg">{{ lang.flag }}</span>
          <span>{{ lang.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const authStore  = useAuthStore()
const open       = ref(false)
const isRtl      = computed(() => locale.value === 'ar')

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

const currentFlag  = computed(() => languages.find((l) => l.code === locale.value)?.flag || '🌐')
const currentLabel = computed(() => languages.find((l) => l.code === locale.value)?.label || '')

function toggle() { open.value = !open.value }

async function select(code) {
  locale.value = code
  open.value   = false
  document.documentElement.lang = code
  document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr'
  localStorage.setItem('preferred_language', code)

  if (authStore.isAuthenticated) {
    await authStore.updateLanguage(code)
  }
}

function handleClickOutside(e) {
  if (!e.target.closest('.relative')) open.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
