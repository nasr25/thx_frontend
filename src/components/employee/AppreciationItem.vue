<template>
  <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
    <!-- Avatar -->
    <RouterLink :to="`/employees/${sender?.id}`" class="shrink-0">
      <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
        <img
          v-if="sender?.profile_photo_url"
          :src="sender.profile_photo_url"
          :alt="sender?.full_name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
          {{ sender?.display_name?.[0]?.toUpperCase() || '?' }}
        </div>
      </div>
    </RouterLink>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-1 flex-wrap">
        <RouterLink :to="`/employees/${sender?.id}`" class="text-sm font-semibold text-gray-900 hover:text-indigo-600">
          {{ sender?.display_name || sender?.full_name }}
        </RouterLink>
        <span class="text-xs text-gray-400">{{ $t('appreciation.heart') }}</span>
        <span
          v-if="reasonLabel"
          class="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full"
        >
          {{ reasonLabel }}
        </span>
      </div>
      <p v-if="appreciation.message" class="text-sm text-gray-600 mt-0.5 line-clamp-2">
        "{{ appreciation.message }}"
      </p>
      <p v-else class="text-sm text-gray-400 italic mt-0.5">{{ $t('appreciation.no_message') }}</p>
      <p class="text-xs text-gray-400 mt-1">{{ appreciation.formatted_date }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ appreciation: { type: Object, required: true } })
const { locale } = useI18n()
const sender = computed(() => props.appreciation.sender)
const reasonLabel = computed(() => {
  const r = props.appreciation.reason
  if (!r) return null
  return locale.value === 'ar' ? (r.name_ar || r.name) : r.name
})
</script>
