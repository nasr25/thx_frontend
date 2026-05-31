<template>
  <header class="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
    <div class="flex items-center justify-between h-16 px-4 lg:px-6">

      <!-- Left: hamburger + logo -->
      <div class="flex items-center gap-3">
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-xl hover:bg-gray-100 text-gray-500 lg:hidden"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
        <RouterLink to="/dashboard" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <StarIcon class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-gray-900 text-lg hidden sm:block">{{ platformName }}</span>
        </RouterLink>
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-2">
        <LanguageSwitcher />

        <!-- Notifications -->
        <RouterLink
          to="/notifications"
          class="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <BellIcon class="w-5 h-5" />
          <span
            v-if="unreadCount > 0"
            class="absolute top-1 end-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </RouterLink>

        <!-- User menu -->
        <div class="relative" ref="menuRef">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
              {{ user?.display_name?.[0]?.toUpperCase() || '?' }}
            </div>
            <div class="hidden md:block text-start">
              <p class="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                {{ user?.display_name }}
              </p>
              <p class="text-xs text-gray-400 truncate max-w-[120px]">
                {{ user?.department?.name || user?.job_title }}
              </p>
            </div>
            <ChevronDownIcon class="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          <Transition name="fade">
            <div
              v-if="showUserMenu"
              class="absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-52 z-50"
              :class="isRtl ? 'left-0' : 'right-0'"
            >
              <!-- User info -->
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="font-semibold text-gray-900 text-sm">{{ user?.display_name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                <!-- Windows auth badge -->
                <span class="mt-1.5 inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  <ComputerDesktopIcon class="w-3 h-3" />
                  Windows Auth
                </span>
              </div>

              <RouterLink
                to="/settings"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                @click="showUserMenu = false"
              >
                <Cog6ToothIcon class="w-4 h-4" />
                {{ $t('nav.settings') }}
              </RouterLink>

              <!-- Admin panel link (only for admins) -->
              <RouterLink
                v-if="isAdmin"
                to="/admin/dashboard"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50"
                @click="showUserMenu = false"
              >
                <ShieldCheckIcon class="w-4 h-4" />
                {{ $t('admin.dashboard') }}
              </RouterLink>

              <hr class="border-gray-100 my-1" />

              <!-- Session info: Windows auth users don't "log out" in the traditional sense -->
              <div class="px-4 py-2">
                <p class="text-[11px] text-gray-400 leading-snug">
                  Signed in via Windows Authentication.
                  <template v-if="expiresAt">
                    Session expires {{ expiresSoon }}.
                  </template>
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Bars3Icon, BellIcon, ChevronDownIcon, StarIcon,
  Cog6ToothIcon, ShieldCheckIcon, ComputerDesktopIcon
} from '@heroicons/vue/24/outline'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useAuthStore }         from '@/stores/auth'
import { useSettingsStore }     from '@/stores/settings'
import { useNotificationStore } from '@/stores/notifications'

defineEmits(['toggle-sidebar'])

const { locale }  = useI18n()
const authStore   = useAuthStore()
const settings    = useSettingsStore()
const notifStore  = useNotificationStore()
const menuRef     = ref(null)
const showUserMenu = ref(false)

const user         = computed(() => authStore.user)
const isAdmin      = computed(() => authStore.isAdmin)
const isRtl        = computed(() => locale.value === 'ar')
const unreadCount  = computed(() => notifStore.unreadCount)
const expiresAt    = computed(() => authStore.expiresAt)
const platformName = computed(() => locale.value === 'ar' ? settings.settings.platform_name_ar : settings.settings.platform_name_en)

const expiresSoon = computed(() => {
  if (!expiresAt.value) return ''
  const exp = new Date(expiresAt.value)
  const diff = exp - new Date()
  if (diff < 60 * 60 * 1000) return 'soon'
  return 'in ' + Math.round(diff / 3600000) + 'h'
})

function handleClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  notifStore.fetchUnreadCount()
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
