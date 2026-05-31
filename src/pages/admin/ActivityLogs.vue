<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header flex items-center justify-between">
      <h1 class="page-title">{{ $t('admin.activity_logs') }}</h1>
    </div>

    <div class="card">
      <LoadingSpinner v-if="loading" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-start text-gray-500 border-b border-gray-100">
              <th class="pb-3 font-medium">{{ $t('admin.user') }}</th>
              <th class="pb-3 font-medium">{{ $t('admin.action') }}</th>
              <th class="pb-3 font-medium hidden md:table-cell">Description</th>
              <th class="pb-3 font-medium hidden lg:table-cell">{{ $t('admin.ip_address') }}</th>
              <th class="pb-3 font-medium text-end">{{ $t('admin.timestamp') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
              <td class="py-3">
                <span class="font-medium text-gray-900">{{ log.user?.full_name || 'System' }}</span>
                <span v-if="log.user?.username" class="text-xs text-gray-400 block">@{{ log.user.username }}</span>
              </td>
              <td class="py-3">
                <span
                  class="badge"
                  :class="actionBadge(log.action)"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="py-3 hidden md:table-cell max-w-xs">
                <span class="text-gray-600 truncate block">{{ log.description }}</span>
              </td>
              <td class="py-3 hidden lg:table-cell text-gray-500 font-mono text-xs">
                {{ log.ip_address }}
              </td>
              <td class="py-3 text-end text-gray-500 whitespace-nowrap text-xs">
                {{ new Date(log.created_at).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          v-for="page in meta.last_page"
          :key="page"
          @click="fetchLogs(page)"
          class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
          :class="meta.current_page === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { adminService } from '@/services/adminService'

const logs    = ref([])
const meta    = ref({})
const loading = ref(false)

async function fetchLogs(page = 1) {
  loading.value = true
  try {
    const res = await adminService.getActivityLogs({ page, per_page: 20 })
    if (res.success) {
      logs.value = res.data
      meta.value = res.meta
    }
  } finally {
    loading.value = false
  }
}

function actionBadge(action) {
  const map = {
    login:                'bg-green-50 text-green-700',
    logout:               'bg-gray-100 text-gray-600',
    send_appreciation:    'bg-red-50 text-red-600',
    delete_appreciation:  'bg-orange-50 text-orange-600',
    update_settings:      'bg-blue-50 text-blue-600',
    upload_logo:          'bg-purple-50 text-purple-600',
  }
  return map[action] || 'bg-gray-100 text-gray-600'
}

onMounted(() => fetchLogs())
</script>
