<template>
  <div class="w-full max-w-sm text-center animate-fade-in">
    <div class="bg-white rounded-3xl shadow-xl p-10">
      <template v-if="!failed">
        <!-- Loading state -->
        <div class="w-16 h-16 mx-auto mb-5 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <div class="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Signing you in...</h2>
        <p class="text-sm text-gray-500 mt-2">Verifying your Windows identity</p>
      </template>

      <template v-else>
        <!-- Failure state -->
        <div class="w-16 h-16 mx-auto mb-5 bg-red-50 rounded-2xl flex items-center justify-center">
          <ExclamationCircleIcon class="w-8 h-8 text-red-500" />
        </div>
        <h2 class="text-lg font-semibold text-gray-900">Could not sign you in</h2>
        <p class="text-sm text-gray-500 mt-2 mb-2">
          {{ errorDetail || 'Windows authentication is unavailable.' }}
        </p>
        <p class="text-xs text-gray-400 mb-6">
          This usually means the app is not running on IIS with Windows Authentication,
          or you are off the corporate network.
        </p>

        <div class="space-y-2">
          <button @click="retry" class="btn-primary w-full">
            <ArrowPathIcon class="w-4 h-4" />
            Try Again
          </button>
          <RouterLink to="/admin/login" class="btn-secondary w-full">
            <ShieldCheckIcon class="w-4 h-4" />
            Sign in as Administrator
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ExclamationCircleIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const router      = useRouter()
const route       = useRoute()
const authStore   = useAuthStore()
const failed      = ref(false)
const errorDetail = ref('')

onMounted(async () => {
  try {
    await authStore.windowsLogin()
    const redirect = route.query.redirect || '/dashboard'
    router.replace(redirect)
  } catch (err) {
    errorDetail.value = err.response?.data?.message || ''
    failed.value = true
  }
})

function retry() {
  failed.value = false
  // Reload triggers IIS Windows Auth challenge again
  window.location.reload()
}
</script>
