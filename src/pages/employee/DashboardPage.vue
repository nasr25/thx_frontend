<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Welcome Card ─────────────────────────────────────────────────────── -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-lg">
      <!-- Decorative circles -->
      <div class="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/10" />
      <div class="absolute -bottom-6 -start-6 w-24 h-24 rounded-full bg-white/5" />

      <div class="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <!-- Avatar -->
        <div class="shrink-0">
          <img
            v-if="user?.profile_photo_url"
            :src="user.profile_photo_url"
            :alt="user.display_name"
            class="w-16 h-16 rounded-2xl object-cover border-2 border-white/30"
          />
          <div v-else class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {{ user?.display_name?.[0]?.toUpperCase() || '?' }}
          </div>
        </div>

        <!-- Name & Department -->
        <div class="flex-1 min-w-0">
          <p class="text-indigo-100 text-sm mb-0.5">{{ greeting }}</p>
          <h1 class="text-2xl font-bold truncate">{{ user?.display_name || user?.full_name }}</h1>
          <div class="flex flex-wrap items-center gap-2 mt-1.5">
            <span v-if="user?.job_title" class="text-sm text-indigo-100">{{ user.job_title }}</span>
            <span v-if="user?.department" class="text-sm text-indigo-200">·</span>
            <span v-if="user?.department" class="inline-flex items-center gap-1 text-sm bg-white/15 px-2.5 py-0.5 rounded-full font-medium">
              <BuildingOfficeIcon class="w-3.5 h-3.5" />
              {{ user.department.name }}
            </span>
          </div>
        </div>

        <!-- Today's date -->
        <div class="shrink-0 text-end hidden sm:block">
          <p class="text-indigo-200 text-xs">{{ todayStr }}</p>
          <p class="text-white font-semibold text-sm mt-0.5">{{ monthStr }}</p>
        </div>
      </div>
    </div>

    <!-- ── Stats Row ────────────────────────────────────────────────────────── -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card animate-pulse h-28">
        <div class="h-8 w-16 bg-gray-200 rounded mb-2" />
        <div class="h-4 w-28 bg-gray-100 rounded" />
      </div>
    </div>

    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Total Thanks Received -->
      <div class="card flex flex-col gap-2">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-4xl font-extrabold text-red-500">{{ stats?.total_received ?? 0 }}</p>
            <p class="text-sm text-gray-500 mt-1 leading-tight">
              {{ locale === 'ar' ? 'إجمالي التقديرات' : 'Total Thanks Received' }}
            </p>
          </div>
          <span class="text-3xl">❤️</span>
        </div>
      </div>

      <!-- This Month Received -->
      <div class="card flex flex-col gap-2">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-4xl font-extrabold text-indigo-600">{{ stats?.monthly_received ?? 0 }}</p>
            <p class="text-sm text-gray-500 mt-1 leading-tight">
              {{ locale === 'ar' ? 'هذا الشهر' : 'Received This Month' }}
            </p>
          </div>
          <span class="text-3xl">📅</span>
        </div>
      </div>

      <!-- Monthly Sending Limit Card -->
      <div class="card col-span-2 flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-700">
              {{ locale === 'ar' ? 'حصتي الشهرية' : 'Monthly Appreciation Quota' }}
            </p>
            <div class="flex items-baseline gap-1.5 mt-1">
              <span class="text-4xl font-extrabold" :class="remaining === 0 ? 'text-red-500' : 'text-green-600'">
                {{ stats?.monthly_sent ?? 0 }}
              </span>
              <span class="text-2xl font-bold text-gray-400">/</span>
              <span class="text-2xl font-bold text-gray-600">{{ stats?.monthly_limit ?? '–' }}</span>
              <span class="text-sm text-gray-500 ms-1">
                {{ locale === 'ar' ? 'مُرسَل' : 'sent' }}
              </span>
            </div>
          </div>
          <span class="text-3xl">🎯</span>
        </div>

        <!-- Progress bar -->
        <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="remaining === 0 ? 'bg-red-500' : remaining <= 1 ? 'bg-amber-500' : 'bg-green-500'"
            :style="`width: ${limitPercent}%`"
          />
        </div>

        <!-- Remaining + expiry -->
        <div class="flex items-center justify-between text-xs">
          <span :class="remaining === 0 ? 'text-red-600 font-semibold' : 'text-gray-500'">
            <template v-if="remaining === 0">
              {{ locale === 'ar' ? 'استُنفدت الحصة الشهرية' : 'Monthly quota exhausted' }}
            </template>
            <template v-else>
              <span class="font-semibold text-green-600">{{ remaining }}</span>
              {{ locale === 'ar' ? ' متبقٍ هذا الشهر' : ' remaining this month' }}
            </template>
          </span>

          <span class="flex items-center gap-1 text-gray-400">
            <ArrowPathIcon class="w-3 h-3" />
            {{ locale === 'ar' ? 'يتجدد' : 'Resets' }}
            <strong class="text-gray-600 ms-0.5">{{ resetDate }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- ── Bottom Grid ───────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Latest Appreciations received -->
      <div class="lg:col-span-2 card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">
            {{ locale === 'ar' ? 'أحدث التقديرات المستلمة' : 'Latest Appreciations Received' }}
          </h2>
          <RouterLink to="/history" class="text-xs text-indigo-600 hover:text-indigo-700">
            {{ locale === 'ar' ? 'عرض الكل ←' : 'View All →' }}
          </RouterLink>
        </div>

        <LoadingSpinner v-if="loading" size="sm" />

        <div v-else-if="!latestAppreciations.length" class="py-10 text-center">
          <span class="text-4xl block mb-3">💝</span>
          <p class="text-sm text-gray-500">
            {{ locale === 'ar' ? 'لا توجد تقديرات بعد. كن أول من يُقدّر زميله!' : 'No appreciations yet. Be the first to appreciate someone!' }}
          </p>
          <RouterLink to="/employees" class="btn-primary mt-4 inline-flex">
            {{ locale === 'ar' ? 'ابحث عن موظف' : 'Find Employees' }}
          </RouterLink>
        </div>

        <div v-else class="divide-y divide-gray-50">
          <AppreciationItem
            v-for="item in latestAppreciations"
            :key="item.id"
            :appreciation="item"
            class="py-1 first:pt-0 last:pb-0"
          />
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="card">
        <h2 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🏆 {{ locale === 'ar' ? 'الأكثر تقديراً' : 'Top Appreciated' }}
        </h2>

        <LoadingSpinner v-if="loading" size="sm" />

        <div v-else class="space-y-2">
          <RouterLink
            v-for="(emp, index) in leaderboard"
            :key="emp.id"
            :to="`/employees/${emp.id}`"
            class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <!-- Rank badge -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              :class="[
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-200 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-indigo-50 text-indigo-500 text-xs'
              ]"
            >
              {{ index < 3 ? ['🥇','🥈','🥉'][index] : index + 1 }}
            </div>

            <!-- Name + dept -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {{ emp.display_name || emp.full_name }}
              </p>
              <p class="text-xs text-gray-400 truncate">{{ emp.department?.name }}</p>
            </div>

            <!-- Count -->
            <div class="flex items-center gap-1 text-xs text-gray-500 shrink-0">
              <HeartIcon class="w-3.5 h-3.5 text-red-400" />
              <span class="font-semibold">{{ emp.appreciation_count ?? emp.received_appreciations_count ?? 0 }}</span>
            </div>
          </RouterLink>

          <div v-if="!leaderboard.length" class="py-6 text-center text-gray-400 text-sm">
            No data yet
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { HeartIcon, BuildingOfficeIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner   from '@/components/common/LoadingSpinner.vue'
import AppreciationItem from '@/components/employee/AppreciationItem.vue'
import { useAppreciationStore } from '@/stores/appreciation'
import { useAuthStore } from '@/stores/auth'

const { locale } = useI18n()
const apprStore  = useAppreciationStore()
const authStore  = useAuthStore()

const user    = computed(() => authStore.user)
const loading = computed(() => apprStore.loading)
const stats   = computed(() => apprStore.dashboard?.stats)
const latestAppreciations = computed(() => apprStore.dashboard?.latest_appreciations || [])
const leaderboard         = computed(() => apprStore.dashboard?.leaderboard || [])

const remaining    = computed(() => stats.value?.monthly_remaining ?? 0)
const limitPercent = computed(() => {
  const limit = stats.value?.monthly_limit || 1
  const sent  = stats.value?.monthly_sent  || 0
  return Math.min(100, Math.round((sent / limit) * 100))
})

// Reset date = 1st of next month
const resetDate = computed(() => {
  const d = new Date()
  const first = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return first.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (locale.value === 'ar') {
    if (h < 12) return 'صباح الخير 👋'
    if (h < 17) return 'مساء الخير 👋'
    return 'مساء النور 👋'
  }
  if (h < 12) return 'Good morning 👋'
  if (h < 17) return 'Good afternoon 👋'
  return 'Good evening 👋'
})

const todayStr = computed(() => new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long' }))
const monthStr = computed(() => new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' }))

onMounted(() => apprStore.fetchDashboard())
</script>
