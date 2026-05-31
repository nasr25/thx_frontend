<template>
  <div class="card hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
    <!-- Top -->
    <div class="flex items-start gap-4">
      <!-- Avatar (links to profile only for admins) -->
      <component :is="canViewProfile ? 'RouterLink' : 'div'" :to="canViewProfile ? `/employees/${employee.id}` : undefined" class="shrink-0">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
          {{ employee.display_name?.[0]?.toUpperCase() || '?' }}
        </div>
      </component>

      <div class="flex-1 min-w-0">
        <component :is="canViewProfile ? 'RouterLink' : 'div'" :to="canViewProfile ? `/employees/${employee.id}` : undefined">
          <h3 class="font-semibold text-gray-900 truncate" :class="canViewProfile ? 'hover:text-indigo-600 transition-colors' : ''">
            {{ employee.display_name || employee.full_name }}
          </h3>
        </component>
        <p class="text-sm text-gray-500 truncate">{{ employee.job_title || '—' }}</p>
        <span v-if="employee.department" class="badge bg-indigo-50 text-indigo-700 mt-1">
          {{ employee.department.name }}
        </span>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-50">
      <div class="flex items-center gap-1.5 text-sm text-gray-500">
        <StarIcon class="w-4 h-4 text-red-400" />
        <span class="font-semibold text-gray-700">{{ employee.total_appreciations || 0 }}</span>
        <span class="text-xs">{{ $t('employees.total_appreciations') }}</span>
      </div>

      <button
        @click="$emit('appreciate', employee)"
        class="btn-primary py-1.5 px-3 text-sm"
      >
        <StarIcon class="w-4 h-4" />
        {{ $t('employees.appreciate') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { StarIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ employee: { type: Object, required: true } })
defineEmits(['appreciate'])

const authStore = useAuthStore()
// Only admins (or the employee viewing themselves) may open a full profile.
const canViewProfile = computed(() =>
  authStore.isAdmin || authStore.user?.id === props.employee.id
)
</script>
