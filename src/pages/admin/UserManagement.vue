<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">{{ $t('admin.user_management') }}</h1>
      <p class="page-subtitle">{{ $t('admin.user_management_hint') }}</p>
    </div>

    <!-- Search -->
    <div class="relative max-w-md">
      <MagnifyingGlassIcon class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        v-model="search"
        type="text"
        class="input ps-10"
        :placeholder="$t('employees.search_placeholder')"
        @input="debouncedFetch"
      />
    </div>

    <div class="card">
      <LoadingSpinner v-if="loading" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-start text-gray-500 border-b border-gray-100">
              <th class="pb-3 font-medium">{{ $t('admin.user') }}</th>
              <th class="pb-3 font-medium hidden sm:table-cell">{{ $t('employees.department') }}</th>
              <th class="pb-3 font-medium text-center">{{ $t('admin.is_admin') }}</th>
              <th class="pb-3 font-medium text-center">{{ $t('admin.is_active') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
              <td class="py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                    {{ u.full_name?.[0]?.toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ u.full_name }}</p>
                    <p class="text-xs text-gray-400 truncate">@{{ u.username }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 hidden sm:table-cell text-gray-500">{{ u.department?.name || '—' }}</td>

              <!-- Admin toggle -->
              <td class="py-3 text-center">
                <button
                  @click="toggleAdmin(u)"
                  :disabled="u.id === currentUserId || u.busy"
                  class="relative inline-flex w-11 h-6 rounded-full transition-colors disabled:opacity-40"
                  :class="isAdmin(u) ? 'bg-indigo-600' : 'bg-gray-200'"
                  :title="u.id === currentUserId ? $t('admin.cannot_change_self') : ''"
                >
                  <span
                    class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    :class="isAdmin(u) ? (isRtl ? 'translate-x-[-20px] start-0.5' : 'translate-x-5 start-0.5') : 'start-0.5'"
                  />
                </button>
              </td>

              <!-- Active toggle -->
              <td class="py-3 text-center">
                <button
                  @click="toggleActive(u)"
                  :disabled="u.id === currentUserId || u.busy"
                  class="relative inline-flex w-11 h-6 rounded-full transition-colors disabled:opacity-40"
                  :class="u.is_active ? 'bg-green-500' : 'bg-gray-200'"
                >
                  <span
                    class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    :class="u.is_active ? (isRtl ? 'translate-x-[-20px] start-0.5' : 'translate-x-5 start-0.5') : 'start-0.5'"
                  />
                </button>
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
          @click="fetchUsers(page)"
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const toast     = useToast()
const authStore = useAuthStore()

const users   = ref([])
const meta    = ref({})
const loading = ref(false)
const search  = ref('')

const currentUserId = computed(() => authStore.user?.id)
const isRtl         = computed(() => locale.value === 'ar')

function isAdmin(u) {
  return (u.roles || []).some((r) => r === 'admin' || r === 'super-admin')
}

let timer
function debouncedFetch() {
  clearTimeout(timer)
  timer = setTimeout(() => fetchUsers(1), 300)
}

async function fetchUsers(page = 1) {
  loading.value = true
  try {
    const res = await adminService.getUsers({ page, per_page: 20, search: search.value })
    if (res.success) {
      users.value = res.data.map((u) => ({ ...u, busy: false }))
      meta.value  = res.meta
    }
  } finally {
    loading.value = false
  }
}

async function toggleAdmin(u) {
  u.busy = true
  try {
    const res = await adminService.setUserAdmin(u.id, !isAdmin(u))
    if (res.success) {
      u.roles = res.data.roles
      toast.success(res.message)
    }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update access')
  } finally {
    u.busy = false
  }
}

async function toggleActive(u) {
  u.busy = true
  try {
    const res = await adminService.setUserStatus(u.id, !u.is_active)
    if (res.success) {
      u.is_active = res.data.is_active
      toast.success(res.message)
    }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update status')
  } finally {
    u.busy = false
  }
}

onMounted(() => fetchUsers())
</script>
