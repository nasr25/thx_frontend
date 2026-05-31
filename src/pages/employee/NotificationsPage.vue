<template>
  <div class="space-y-4 animate-fade-in">
    <div class="page-header flex items-center justify-between">
      <div>
        <h1 class="page-title">{{ $t('notifications.title') }}</h1>
        <p v-if="unreadCount > 0" class="text-sm text-indigo-600 font-medium mt-1">
          {{ unreadCount }} {{ $t('notifications.unread') }}
        </p>
      </div>
      <button v-if="unreadCount > 0" @click="markAll" class="btn-secondary text-sm py-2">
        {{ $t('notifications.mark_all_read') }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="notifications.length === 0" class="card py-16 text-center">
      <span class="text-5xl block mb-4">🔔</span>
      <p class="text-gray-500">{{ $t('notifications.no_notifications') }}</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        @click="markRead(notif)"
        class="card cursor-pointer hover:shadow-md transition-all"
        :class="!notif.read_at ? 'border-indigo-100 bg-indigo-50/30' : ''"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <StarIcon class="w-5 h-5 text-indigo-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="font-semibold text-gray-900 text-sm">{{ notif.display_title || notif.title }}</p>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="!notif.read_at" class="w-2 h-2 rounded-full bg-indigo-600" />
                <span class="text-xs text-gray-400 whitespace-nowrap">
                  {{ new Date(notif.created_at).toLocaleDateString() }}
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-0.5">{{ notif.display_body || notif.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { StarIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useNotificationStore } from '@/stores/notifications'

const store = useNotificationStore()

const notifications = computed(() => store.notifications)
const unreadCount   = computed(() => store.unreadCount)
const loading       = computed(() => store.loading)

async function markRead(notif) {
  if (!notif.read_at) {
    await store.markAsRead(notif.id)
  }
}

async function markAll() {
  await store.markAllAsRead()
}

onMounted(() => store.fetchNotifications())
</script>
