<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">{{ $t('employees.title') }}</h1>
    </div>

    <!-- Search bar -->
    <div class="relative">
      <MagnifyingGlassIcon class="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        class="input ps-11 py-3 text-base"
        :placeholder="$t('employees.search_placeholder')"
        @input="debouncedSearch"
      />
      <ArrowPathIcon v-if="loading" class="absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
    </div>

    <!-- Results -->
    <div v-if="loading && employees.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="card animate-pulse">
        <div class="flex gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gray-200" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4" />
            <div class="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="employees.length === 0 && searchQuery.length >= 2" class="py-16 text-center">
      <span class="text-5xl block mb-4">🔍</span>
      <p class="text-gray-500">{{ $t('employees.no_results') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <EmployeeCard
        v-for="emp in employees"
        :key="emp.id"
        :employee="emp"
        @appreciate="openAppreciation(emp)"
      />
    </div>

    <!-- Appreciation Modal -->
    <AppreciationModal
      v-model="showModal"
      :employee="selectedEmployee"
      @sent="handleSent"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import EmployeeCard      from '@/components/employee/EmployeeCard.vue'
import AppreciationModal from '@/components/employee/AppreciationModal.vue'
import { employeeService } from '@/services/employeeService'
import { useAuthStore }    from '@/stores/auth'
import { useAppreciationStore } from '@/stores/appreciation'

const authStore  = useAuthStore()
const apprStore  = useAppreciationStore()
const currentUser = computed(() => authStore.user)

const searchQuery    = ref('')
const employees      = ref([])
const loading        = ref(false)
const showModal      = ref(false)
const selectedEmployee = ref(null)

let debounceTimer

function debouncedSearch() {
  clearTimeout(debounceTimer)
  if (searchQuery.value.length < 2) {
    employees.value = []
    return
  }
  debounceTimer = setTimeout(doSearch, 300)
}

async function doSearch() {
  loading.value = true
  try {
    const res = await employeeService.search(searchQuery.value)
    if (res.success) {
      employees.value = (res.data || []).filter((e) => e.id !== currentUser.value?.id)
    }
  } finally {
    loading.value = false
  }
}

function openAppreciation(emp) {
  selectedEmployee.value = emp
  showModal.value = true
}

function handleSent() {
  apprStore.fetchDashboard()
}
</script>
