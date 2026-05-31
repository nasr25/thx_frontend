<template>
  <div class="card hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
    <!-- Top -->
    <div class="flex items-start gap-4">
      <RouterLink :to="`/employees/${employee.id}`" class="shrink-0">
        <div class="relative">
          <img
            v-if="employee.profile_photo_url"
            :src="employee.profile_photo_url"
            :alt="employee.full_name"
            class="w-14 h-14 rounded-2xl object-cover border border-gray-100"
          />
          <div v-else class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            {{ employee.display_name?.[0]?.toUpperCase() || '?' }}
          </div>
        </div>
      </RouterLink>

      <div class="flex-1 min-w-0">
        <RouterLink :to="`/employees/${employee.id}`">
          <h3 class="font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors">
            {{ employee.display_name || employee.full_name }}
          </h3>
        </RouterLink>
        <p class="text-sm text-gray-500 truncate">{{ employee.job_title || '—' }}</p>
        <span v-if="employee.department" class="badge bg-indigo-50 text-indigo-700 mt-1">
          {{ employee.department.name }}
        </span>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-50">
      <div class="flex items-center gap-1.5 text-sm text-gray-500">
        <HeartIcon class="w-4 h-4 text-red-400" />
        <span class="font-semibold text-gray-700">{{ employee.total_appreciations || 0 }}</span>
        <span class="text-xs">{{ $t('employees.total_appreciations') }}</span>
      </div>

      <button
        @click="$emit('appreciate', employee)"
        class="btn-primary py-1.5 px-3 text-sm"
      >
        <HeartIcon class="w-4 h-4" />
        {{ $t('employees.appreciate') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { HeartIcon } from '@heroicons/vue/24/outline'

defineProps({ employee: { type: Object, required: true } })
defineEmits(['appreciate'])
</script>
