<template>
  <div class="min-h-screen bg-gray-50 flex" :dir="isRtl ? 'rtl' : 'ltr'">

    <!-- Admin Sidebar -->
    <aside class="hidden lg:flex flex-col w-64 bg-gray-900 text-white shrink-0">
      <!-- Logo -->
      <div class="flex items-center gap-3 h-16 px-5 border-b border-gray-700">
        <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <ShieldCheckIcon class="w-4 h-4 text-white" />
        </div>
        <div>
          <p class="font-bold text-sm truncate max-w-[140px]">{{ platformName }}</p>
          <p class="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in adminNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path.startsWith(item.to) ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Bottom links -->
      <div class="px-3 pb-4 space-y-1 border-t border-gray-700 pt-4">
        <RouterLink
          to="/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          {{ $t('nav.dashboard') }}
        </RouterLink>

        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 transition-all"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          {{ $t('auth.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <h1 class="font-semibold text-gray-900">{{ $t('nav.admin') }}</h1>
        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
              {{ user?.display_name?.[0]?.toUpperCase() }}
            </div>
            <span class="hidden sm:block">{{ user?.display_name }}</span>
          </div>
        </div>
      </header>

      <main class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" :key="$route.path" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ShieldCheckIcon, HomeIcon, Cog6ToothIcon, HeartIcon,
  ClipboardDocumentListIcon, ChartBarIcon,
  ArrowLeftIcon, ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useAuthStore }     from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const { t, locale } = useI18n()
const router     = useRouter()
const authStore  = useAuthStore()
const settings   = useSettingsStore()

const user         = computed(() => authStore.user)
const isRtl        = computed(() => locale.value === 'ar')
const platformName = computed(() => locale.value === 'ar' ? settings.settings.platform_name_ar : settings.settings.platform_name_en)

const adminNavItems = computed(() => [
  { to: '/admin/dashboard',     label: t('admin.dashboard'),               icon: HomeIcon },
  { to: '/admin/settings',      label: t('admin.settings'),                icon: Cog6ToothIcon },
  { to: '/admin/appreciations', label: t('admin.appreciation_management'), icon: HeartIcon },
  { to: '/admin/activity-logs', label: t('admin.activity_logs'),           icon: ClipboardDocumentListIcon },
  { to: '/admin/analytics',     label: t('admin.analytics'),               icon: ChartBarIcon },
])

async function handleLogout() {
  await authStore.logout()
  router.push('/admin/login')
}
</script>
