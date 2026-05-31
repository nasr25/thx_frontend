<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="page-title">{{ $t('admin.analytics') }}</h1>
      </div>
      <button @click="exportCsv" class="btn-secondary">
        <ArrowDownTrayIcon class="w-4 h-4" />
        {{ $t('admin.export_csv') }}
      </button>
    </div>

    <!-- Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.key" class="card text-center">
        <p class="text-3xl font-bold" :class="stat.color">{{ stat.value }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Trends + Dept -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">{{ $t('admin.monthly_trends') }}</h2>
        <LineChart :data="trendsData" :height="220" />
      </div>
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">{{ $t('admin.department_activity') }}</h2>
        <BarChart :data="deptData" :height="220" />
      </div>
    </div>

    <!-- Top appreciated -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-4">{{ $t('admin.top_appreciated') }}</h2>
      <div class="space-y-3">
        <div v-for="(emp, i) in topAppreciated" :key="emp.id" class="flex items-center gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            :class="i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'">
            {{ i + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium text-gray-900 truncate">{{ emp.full_name }}</p>
              <span class="badge bg-red-50 text-red-600 shrink-0">⭐ {{ emp.count }}</span>
            </div>
            <div class="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-500 rounded-full transition-all"
                :style="`width: ${Math.min(100, (emp.count / (topAppreciated[0]?.count || 1)) * 100)}%`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import LineChart from '@/components/admin/LineChart.vue'
import BarChart  from '@/components/admin/BarChart.vue'
import { adminService } from '@/services/adminService'

const { t, locale } = useI18n()
const toast = useToast()

const overview       = ref({})
const trends         = ref([])
const departments    = ref([])
const topAppreciated = ref([])

const stats = computed(() => [
  { key: 'total',   value: overview.value.total_appreciations || 0,   label: t('admin.total_appreciations'), color: 'text-red-600' },
  { key: 'monthly', value: overview.value.monthly_appreciations || 0, label: t('admin.monthly_appreciations'), color: 'text-indigo-600' },
  { key: 'emp',     value: overview.value.total_employees || 0,       label: t('admin.total_employees'), color: 'text-green-600' },
  { key: 'eng',     value: `${overview.value.engagement_rate || 0}%`, label: t('admin.engagement_rate'), color: 'text-purple-600' },
])

const trendsData = computed(() => ({
  labels: trends.value.map((m) => m.label || m.month),
  datasets: [{
    label: t('admin.monthly_appreciations'),
    data: trends.value.map((m) => m.count),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    fill: true,
    tension: 0.4,
  }],
}))

const deptData = computed(() => ({
  labels: departments.value.map((d) => locale.value === 'ar' ? (d.name_ar || d.name) : d.name),
  datasets: [{
    label: 'Appreciations',
    data: departments.value.map((d) => d.total),
    backgroundColor: '#6366f1',
    borderRadius: 6,
  }],
}))

async function fetchData() {
  const res = await adminService.getAnalytics()
  if (res.success) {
    overview.value       = res.data.overview
    trends.value         = res.data.monthly_trends
    departments.value    = res.data.department_stats
    topAppreciated.value = res.data.top_appreciated
  }
}

async function exportCsv() {
  try {
    await adminService.exportCsv('month')
    toast.success('Export complete!')
  } catch {
    toast.error('Export failed.')
  }
}

onMounted(fetchData)
</script>
