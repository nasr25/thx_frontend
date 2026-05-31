<template>
  <div class="space-y-6 animate-fade-in">
    <LoadingSpinner v-if="loading" />

    <template v-else-if="employee">
      <!-- Profile Header -->
      <div class="card">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <!-- Avatar -->
          <div class="relative">
            <img
              v-if="employee.profile_photo_url"
              :src="employee.profile_photo_url"
              :alt="employee.full_name"
              class="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
            />
            <div v-else class="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
              {{ employee.display_name?.[0]?.toUpperCase() }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">{{ employee.display_name || employee.full_name }}</h1>
            <p class="text-gray-500">{{ employee.job_title }}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-if="employee.department" class="badge bg-indigo-50 text-indigo-700">
                {{ employee.department.name }}
              </span>
              <span class="badge bg-gray-100 text-gray-600">{{ employee.email }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="!isSelf">
            <button @click="showModal = true" class="btn-primary">
              <StarIcon class="w-4 h-4" />
              {{ $t('employees.appreciate') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4">
        <div class="card text-center">
          <p class="text-3xl font-bold text-indigo-600">{{ stats?.total_received || 0 }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ $t('profile.appreciations_received') }}</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-purple-600">{{ stats?.monthly_received || 0 }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ $t('profile.this_month') }}</p>
        </div>
      </div>

      <!-- Appreciation history -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('profile.appreciation_history') }}</h2>

        <div v-if="appreciations.length === 0" class="py-8 text-center text-gray-500">
          <span class="text-4xl block mb-3">⭐</span>
          {{ $t('profile.no_history') }}
        </div>

        <div v-else class="space-y-2">
          <AppreciationItem
            v-for="item in appreciations"
            :key="item.id"
            :appreciation="item"
          />
        </div>
      </div>
    </template>

    <!-- Appreciation Modal -->
    <AppreciationModal
      v-model="showModal"
      :employee="employee"
      @sent="fetchProfile"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { StarIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner    from '@/components/common/LoadingSpinner.vue'
import AppreciationItem  from '@/components/employee/AppreciationItem.vue'
import AppreciationModal from '@/components/employee/AppreciationModal.vue'
import { employeeService } from '@/services/employeeService'
import { useAuthStore } from '@/stores/auth'

const route     = useRoute()
const authStore = useAuthStore()

const employee     = ref(null)
const stats        = ref(null)
const appreciations = ref([])
const loading      = ref(false)
const showModal    = ref(false)

const isSelf = computed(() => authStore.user?.id === employee.value?.id)

async function fetchProfile() {
  loading.value = true
  try {
    const res = await employeeService.getById(route.params.id)
    if (res.success) {
      employee.value      = res.data.employee
      stats.value         = res.data.stats
      appreciations.value = res.data.latest_appreciations
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)
</script>
