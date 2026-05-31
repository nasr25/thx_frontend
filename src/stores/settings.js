import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { adminService } from '@/services/adminService'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    platform_name_en: 'Appreciation Platform',
    platform_name_ar: 'منصة التقدير',
    primary_color:    '#6366f1',
    secondary_color:  '#f59e0b',
    accent_color:     '#10b981',
    logo_path:        null,
    monthly_appreciation_limit:  10,
    max_daily_appreciations:     5,
    max_same_receiver_per_month: 3,
    email_notifications_enabled: true,
    default_language:            'en',
  })
  const loading = ref(false)

  const primaryColor   = computed(() => settings.value.primary_color || '#6366f1')
  const secondaryColor = computed(() => settings.value.secondary_color || '#f59e0b')
  const logoUrl        = computed(() => settings.value.logo_path ? `/storage/${settings.value.logo_path}` : null)

  async function fetchPublicSettings() {
    try {
      const { data } = await api.get('/admin/settings')
      if (data.success) {
        settings.value = { ...settings.value, ...data.data }
      }
    } catch {
      // Use defaults if unauthenticated
    }
  }

  async function fetchSettings() {
    loading.value = true
    try {
      const res = await adminService.getSettings()
      if (res.success) {
        settings.value = { ...settings.value, ...res.data }
      }
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(payload) {
    loading.value = true
    try {
      const res = await adminService.updateSettings(payload)
      if (res.success) {
        settings.value = { ...settings.value, ...res.data }
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function uploadLogo(file) {
    const res = await adminService.uploadLogo(file)
    if (res.success) {
      await fetchSettings()
    }
    return res
  }

  return {
    settings, loading,
    primaryColor, secondaryColor, logoUrl,
    fetchPublicSettings, fetchSettings, updateSettings, uploadLogo,
  }
})
