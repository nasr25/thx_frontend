<template>
  <div class="space-y-6 animate-fade-in max-w-3xl">
    <div class="page-header">
      <h1 class="page-title">{{ $t('admin.settings') }}</h1>
    </div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <!-- Platform Identity -->
      <div class="card space-y-4">
        <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">Platform Identity</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ $t('admin.platform_name_en') }}</label>
            <input v-model="form.platform_name_en" type="text" class="input" />
          </div>
          <div>
            <label class="label">{{ $t('admin.platform_name_ar') }}</label>
            <input v-model="form.platform_name_ar" type="text" class="input" dir="rtl" />
          </div>
        </div>
      </div>

      <!-- Logo -->
      <div class="card space-y-4">
        <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">{{ $t('admin.logo') }}</h2>

        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            <img v-if="currentLogoUrl" :src="currentLogoUrl" alt="logo" class="w-full h-full object-contain" />
            <PhotoIcon v-else class="w-8 h-8 text-gray-300" />
          </div>

          <div class="space-y-2">
            <input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              class="hidden"
              @change="onLogoSelected"
            />
            <button type="button" class="btn-secondary" :disabled="uploadingLogo" @click="fileInput?.click()">
              <ArrowPathIcon v-if="uploadingLogo" class="w-4 h-4 animate-spin" />
              {{ uploadingLogo ? $t('common.loading') : $t('admin.upload_logo') }}
            </button>
            <p class="text-xs text-gray-400">{{ $t('admin.logo_hint') }}</p>
          </div>
        </div>
      </div>

      <!-- Theme Colors -->
      <div class="card space-y-4">
        <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">Theme Colors</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="label">{{ $t('admin.primary_color') }}</label>
            <div class="flex items-center gap-2">
              <input v-model="form.primary_color" type="color" class="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer" />
              <input v-model="form.primary_color" type="text" class="input font-mono text-sm" placeholder="#6366f1" />
            </div>
          </div>
          <div>
            <label class="label">{{ $t('admin.secondary_color') }}</label>
            <div class="flex items-center gap-2">
              <input v-model="form.secondary_color" type="color" class="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer" />
              <input v-model="form.secondary_color" type="text" class="input font-mono text-sm" placeholder="#f59e0b" />
            </div>
          </div>
        </div>
      </div>

      <!-- Appreciation Rules -->
      <div class="card space-y-4">
        <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">Appreciation Rules</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ $t('admin.monthly_limit') }}</label>
            <input v-model.number="form.monthly_appreciation_limit" type="number" min="1" max="100" class="input" />
          </div>
          <div>
            <label class="label">{{ $t('admin.daily_limit') }}</label>
            <input v-model.number="form.max_daily_appreciations" type="number" min="1" max="50" class="input" />
          </div>
          <div>
            <label class="label">{{ $t('admin.same_receiver_limit') }}</label>
            <input v-model.number="form.max_same_receiver_per_month" type="number" min="1" max="20" class="input" />
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card space-y-4">
        <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-3">Notifications</h2>

        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.email_notifications_enabled" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
          <span class="text-sm font-medium text-gray-700">{{ $t('admin.email_notifications') }}</span>
        </label>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <button type="submit" class="btn-primary" :disabled="saving">
          <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
          {{ saving ? $t('common.loading') : $t('admin.save_settings') }}
        </button>
      </div>
    </form>

    <!-- Success toast handled via vue-toastification -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowPathIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import { useSettingsStore } from '@/stores/settings'
import { adminService } from '@/services/adminService'

const toast         = useToast()
const settingsStore = useSettingsStore()
const saving        = ref(false)

// ── Logo upload ─────────────────────────────────────────────────────────────
const fileInput     = ref(null)
const uploadingLogo = ref(false)
const logoPreview   = ref(null) // full URL returned right after an upload

// Build a displayable URL from the stored logo_path (relative to the backend's
// /storage symlink). After an upload we use the absolute URL the API returns.
const currentLogoUrl = computed(() => {
  if (logoPreview.value) return logoPreview.value
  const p = settingsStore.settings.logo_path
  if (!p) return null
  if (/^https?:\/\//.test(p)) return p
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')
  return `${base}/storage/${p}`
})

async function onLogoSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingLogo.value = true
  try {
    const res = await adminService.uploadLogo(file)
    if (res.success) {
      logoPreview.value = res.data.url
      toast.success(res.message)
      await settingsStore.fetchPublicSettings() // refresh logo_path app-wide
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to upload logo')
  } finally {
    uploadingLogo.value = false
    e.target.value = '' // allow re-selecting the same file
  }
}

const form = reactive({
  platform_name_en:            '',
  platform_name_ar:            '',
  primary_color:               '#6366f1',
  secondary_color:             '#f59e0b',
  monthly_appreciation_limit:  10,
  max_daily_appreciations:     5,
  max_same_receiver_per_month: 3,
  email_notifications_enabled: true,
})

onMounted(async () => {
  await settingsStore.fetchSettings()
  Object.assign(form, settingsStore.settings)
})

async function saveSettings() {
  saving.value = true
  try {
    await settingsStore.updateSettings({ ...form })
    toast.success('Settings saved successfully!')
  } catch {
    toast.error('Failed to save settings')
  } finally {
    saving.value = false
  }
}
</script>
