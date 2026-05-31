<template>
  <!-- Mobile overlay -->
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 z-20 bg-black/30 lg:hidden" @click="$emit('close')" />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 z-20 h-full w-64 bg-white border-e border-gray-100 shadow-xl lg:shadow-none flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static"
    :class="[
      open ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full'),
      'lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 h-16 px-5 border-b border-gray-100 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
        <HeartIcon class="w-4 h-4 text-white" />
      </div>
      <span class="font-bold text-gray-900 truncate">{{ platformName }}</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <NavItem
        v-for="item in navItems"
        :key="item.to"
        v-bind="item"
        @click="$emit('close')"
      />

      <!-- Admin section -->
      <div v-if="isAdmin" class="mt-4 pt-4 border-t border-gray-100">
        <p class="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
        <NavItem to="/admin/dashboard" :label="$t('admin.dashboard')" :icon="ShieldCheckIcon" @click="$emit('close')" />
      </div>
    </nav>

    <!-- User info -->
    <div class="px-4 py-4 border-t border-gray-100 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
          {{ user?.display_name?.[0]?.toUpperCase() || 'U' }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{{ user?.display_name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user?.department?.name }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  HeartIcon, HomeIcon, MagnifyingGlassIcon, BellIcon,
  ClockIcon, Cog6ToothIcon, ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import NavItem from './NavItem.vue'
import { useAuthStore }     from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const { t, locale } = useI18n()
const authStore     = useAuthStore()
const settings      = useSettingsStore()

const user         = computed(() => authStore.user)
const isAdmin      = computed(() => authStore.isAdmin)
const isRtl        = computed(() => locale.value === 'ar')
const platformName = computed(() => locale.value === 'ar' ? settings.settings.platform_name_ar : settings.settings.platform_name_en)

const navItems = computed(() => [
  { to: '/dashboard',     label: t('nav.dashboard'),     icon: HomeIcon },
  { to: '/employees',     label: t('nav.search'),        icon: MagnifyingGlassIcon },
  { to: '/notifications', label: t('nav.notifications'), icon: BellIcon },
  { to: '/history',       label: t('nav.history'),       icon: ClockIcon },
  { to: '/settings',      label: t('nav.settings'),      icon: Cog6ToothIcon },
])
</script>
