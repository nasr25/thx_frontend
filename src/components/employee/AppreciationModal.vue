<template>
  <AppModal v-model="show" :title="$t('appreciation.modal_title', { name: employee?.display_name || employee?.full_name })" size="md">
    <div class="space-y-5">
      <!-- Employee Info -->
      <div class="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
        <div class="relative">
          <img
            v-if="employee?.profile_photo_url"
            :src="employee.profile_photo_url"
            :alt="employee.full_name"
            class="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
          />
          <div v-else class="w-14 h-14 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xl">
            {{ employee?.display_name?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="absolute -bottom-1 -end-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <StarIcon class="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div>
          <p class="font-semibold text-gray-900">{{ employee?.display_name || employee?.full_name }}</p>
          <p class="text-sm text-gray-500">{{ employee?.job_title }}</p>
          <p class="text-xs text-gray-400">{{ employee?.department?.name }}</p>
        </div>
      </div>

      <!-- Star animation -->
      <div class="text-center py-2">
        <div class="inline-flex gap-1">
          <span v-for="i in 3" :key="i" class="text-2xl animate-bounce" :style="`animation-delay: ${i * 0.15}s`">⭐</span>
        </div>
      </div>

      <!-- Reason (required) -->
      <div>
        <label class="label">
          {{ $t('appreciation.reason_label') }}
          <span class="text-red-500">*</span>
        </label>

        <div v-if="reasonsLoading" class="py-2">
          <LoadingSpinner />
        </div>

        <p v-else-if="reasons.length === 0" class="text-sm text-gray-400 py-2">
          {{ $t('appreciation.no_reasons') }}
        </p>

        <div v-else class="space-y-2 mt-1">
          <label
            v-for="r in reasons"
            :key="r.id"
            class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
            :class="reasonId === r.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'"
          >
            <input
              type="radio"
              name="appreciation-reason"
              class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              :value="r.id"
              v-model="reasonId"
            />
            <span class="text-sm text-gray-700">{{ isRtl ? (r.name_ar || r.name) : r.name }}</span>
          </label>
        </div>
      </div>

      <!-- Message -->
      <div>
        <label class="label">{{ $t('appreciation.message_label') }}</label>
        <textarea
          v-model="message"
          rows="4"
          class="input resize-none"
          :placeholder="$t('appreciation.message_placeholder')"
          maxlength="1000"
        />
        <p class="text-xs text-gray-400 mt-1 text-end">{{ message.length }}/1000</p>
      </div>

      <!-- Public toggle -->
      <label class="flex items-center gap-3 cursor-pointer group">
        <div
          class="relative w-10 h-5 rounded-full transition-colors"
          :class="isPublic ? 'bg-indigo-600' : 'bg-gray-200'"
          @click="isPublic = !isPublic"
        >
          <div
            class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
            :class="isPublic ? (isRtl ? 'translate-x-[-20px]' : 'translate-x-5') : (isRtl ? 'translate-x-[-4px]' : 'translate-x-0.5')"
          />
        </div>
        <span class="text-sm text-gray-700">{{ $t('appreciation.is_public') }}</span>
      </label>

      <!-- Remaining limit -->
      <div v-if="remaining !== null" class="flex items-center gap-2 text-sm" :class="remaining > 0 ? 'text-green-600' : 'text-red-600'">
        <InformationCircleIcon class="w-4 h-4" />
        <span>
          {{ remaining > 0
            ? $t('appreciation.remaining', { count: remaining })
            : $t('appreciation.limit_reached') }}
        </span>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="show = false">{{ $t('common.cancel') }}</button>
      <button
        class="btn-primary"
        :disabled="loading || remaining === 0 || !reasonId"
        @click="handleSend"
      >
        <ArrowPathIcon v-if="loading" class="w-4 h-4 animate-spin" />
        {{ loading ? $t('appreciation.sending') : $t('appreciation.send_button') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { StarIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import AppModal from '@/components/common/AppModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useAppreciationStore } from '@/stores/appreciation'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: Boolean,
  employee: Object,
})
const emit = defineEmits(['update:modelValue', 'sent'])

const { t, locale } = useI18n()
const toast      = useToast()
const apprStore  = useAppreciationStore()
const authStore  = useAuthStore()

const show     = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const message  = ref('')
const isPublic = ref(true)
const reasonId = ref(null)
const reasonsLoading = ref(false)
const loading  = computed(() => apprStore.sendLoading)
const isRtl    = computed(() => locale.value === 'ar')
const reasons  = computed(() => apprStore.reasons)

const remaining = computed(() => {
  const dashboard = apprStore.dashboard
  if (!dashboard) return null
  return dashboard.stats.monthly_remaining ?? null
})

watch(() => props.modelValue, async (val) => {
  if (val) {
    message.value = ''
    isPublic.value = true
    reasonId.value = null
    // Load the reason list lazily the first time the modal opens.
    if (apprStore.reasons.length === 0) {
      reasonsLoading.value = true
      try { await apprStore.fetchReasons() } finally { reasonsLoading.value = false }
    }
  }
})

async function handleSend() {
  if (!reasonId.value) {
    toast.error(t('appreciation.reason_required'))
    return
  }
  try {
    await apprStore.sendAppreciation({
      receiver_id: props.employee?.id,
      reason_id: reasonId.value,
      message: message.value.trim() || null,
      is_public: isPublic.value,
    })
    toast.success(locale.value === 'ar' ? 'تم إرسال التقدير بنجاح! ⭐' : 'Appreciation sent! ⭐')
    emit('sent')
    show.value = false
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to send appreciation')
  }
}
</script>
