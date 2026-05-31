import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/adminService'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount   = ref(0)
  const loading       = ref(false)
  const meta          = ref({})

  async function fetchNotifications(params = {}) {
    loading.value = true
    try {
      const res = await adminService.getNotifications(params)
      if (res.success) {
        notifications.value = res.data
        unreadCount.value   = res.unread_count
        meta.value          = res.meta
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await adminService.getUnreadCount()
      if (res.success) {
        unreadCount.value = res.data.count
      }
    } catch {}
  }

  async function markAsRead(id) {
    await adminService.markAsRead(id)
    const notif = notifications.value.find((n) => n.id === id)
    if (notif) {
      notif.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllAsRead() {
    await adminService.markAllAsRead()
    notifications.value.forEach((n) => {
      n.read_at = new Date().toISOString()
    })
    unreadCount.value = 0
  }

  return { notifications, unreadCount, loading, meta, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead }
})
