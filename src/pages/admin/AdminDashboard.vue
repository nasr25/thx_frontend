<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">{{ $t('admin.dashboard') }}</h1>
      <p class="page-subtitle">{{ $t('app.tagline') }}</p>
    </div>

    <!-- Overview stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in overviewStats" :key="stat.key" class="card">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-3xl font-bold" :class="stat.color">{{ stat.value }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
          </div>
          <span class="text-2xl">{{ stat.icon }}</span>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Monthly trends chart -->
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">{{ $t('admin.monthly_trends') }}</h2>
        <LineChart :data="monthlyTrendData" height="200" />
      </div>

      <!-- Department stats -->
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">{{ $t('admin.department_activity') }}</h2>
        <BarChart :data="departmentData" height="200" />
      </div>
    </div>

    <!-- Top appreciated -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-900">{{ $t('admin.top_appreciated') }}</h2>
        <RouterLink to="/admin/analytics" class="text-sm text-indigo-600 hover:text-indigo-700">
          View All →
        </RouterLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-start text-gray-500 border-b border-gray-100">
              <th class="pb-2 font-medium">#</th>
              <th class="pb-2 font-medium">{{ $t('admin.user') }}</th>
              <th class="pb-2 font-medium hidden sm:table-cell">Department</th>
              <th class="pb-2 font-medium text-end">{{ $t('admin.total_appreciations') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="(emp, i) in topAppreciated" :key="emp.id" class="hover:bg-gray-50">
              <td class="py-3 text-gray-400 font-medium">{{ i + 1 }}</td>
              <td class="py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                    {{ emp.full_name?.[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ emp.full_name }}</p>
                    <p class="text-xs text-gray-500">{{ emp.department }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 hidden sm:table-cell text-gray-500">{{ emp.department }}</td>
              <td class="py-3 text-end">
                <span class="badge bg-red-50 text-red-600">⭐ {{ emp.count }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import LineChart from '@/components/admin/LineChart.vue'
import BarChart  from '@/components/admin/BarChart.vue'
import { adminService } from '@/services/adminService'

const { t, locale } = useI18n()

const overview       = ref({})
const monthlyTrends  = ref([])
const deptStats      = ref([])
const topAppreciated = ref([])
const loading        = ref(false)

const overviewStats = computed(() => [
  { key: 'total', value: overview.value.total_appreciations || 0, label: t('admin.total_appreciations'), icon: '⭐', color: 'text-red-600' },
  { key: 'monthly', value: overview.value.monthly_appreciations || 0, label: t('admin.monthly_appreciations'), icon: '📅', color: 'text-indigo-600' },
  { key: 'employees', value: overview.value.total_employees || 0, label: t('admin.total_employees'), icon: '👥', color: 'text-green-600' },
  { key: 'engagement', value: `${overview.value.engagement_rate || 0}%`, label: t('admin.engagement_rate'), icon: '📈', color: 'text-purple-600' },
])

const monthlyTrendData = computed(() => ({
  labels: monthlyTrends.value.map((m) => m.label || m.month),
  datasets: [{
    label: t('admin.monthly_appreciations'),
    data: monthlyTrends.value.map((m) => m.count),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    fill: true,
    tension: 0.4,
  }],
}))

const departmentData = computed(() => ({
  labels: deptStats.value.map((d) => locale.value === 'ar' ? (d.name_ar || d.name) : d.name),
  datasets: [{
    label: t('admin.total_appreciations'),
    data: deptStats.value.map((d) => d.total),
    backgroundColor: '#6366f1',
    borderRadius: 6,
  }],
}))

async function fetchData() {
  loading.value = true
  try {
    const res = await adminService.getDashboard()
    if (res.success) {
      overview.value      = res.data.overview
      monthlyTrends.value = res.data.monthly_trends
      deptStats.value     = res.data.department_stats
      topAppreciated.value = res.data.top_appreciated
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
