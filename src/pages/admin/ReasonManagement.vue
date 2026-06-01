<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header flex items-start justify-between gap-4">
      <div>
        <h1 class="page-title">{{ $t('admin.reason_management') }}</h1>
        <p class="page-subtitle">{{ $t('admin.reason_management_hint') }}</p>
      </div>
      <button class="btn-primary shrink-0" @click="openCreate">
        <PlusIcon class="w-4 h-4" />
        {{ $t('admin.add_reason') }}
      </button>
    </div>

    <div class="card">
      <LoadingSpinner v-if="loading" />

      <p v-else-if="reasons.length === 0" class="text-center text-gray-400 py-8">
        {{ $t('admin.no_reasons') }}
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-start text-gray-500 border-b border-gray-100">
              <th class="pb-3 font-medium">{{ $t('admin.reason_name_en') }}</th>
              <th class="pb-3 font-medium hidden sm:table-cell">{{ $t('admin.reason_name_ar') }}</th>
              <th class="pb-3 font-medium text-center">{{ $t('admin.is_active') }}</th>
              <th class="pb-3 font-medium text-end">{{ $t('admin.action') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="r in reasons" :key="r.id" class="hover:bg-gray-50">
              <td class="py-3 font-medium text-gray-900">{{ r.name }}</td>
              <td class="py-3 hidden sm:table-cell text-gray-500" dir="rtl">{{ r.name_ar || '—' }}</td>

              <!-- Active toggle -->
              <td class="py-3 text-center">
                <button
                  @click="toggleActive(r)"
                  :disabled="r.busy"
                  class="relative inline-flex w-11 h-6 rounded-full transition-colors disabled:opacity-40"
                  :class="r.is_active ? 'bg-green-500' : 'bg-gray-200'"
                >
                  <span
                    class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    :class="r.is_active ? (isRtl ? 'translate-x-[-20px] start-0.5' : 'translate-x-5 start-0.5') : 'start-0.5'"
                  />
                </button>
              </td>

              <!-- Actions -->
              <td class="py-3">
                <div class="flex items-center justify-end gap-2">
                  <button class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" :title="$t('common.edit')" @click="openEdit(r)">
                    <PencilSquareIcon class="w-4 h-4 text-gray-500" />
                  </button>
                  <button class="p-1.5 rounded-lg hover:bg-red-50 transition-colors" :title="$t('common.delete')" @click="confirmDelete(r)">
                    <TrashIcon class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit modal -->
    <AppModal v-model="showForm" :title="editing ? $t('admin.edit_reason') : $t('admin.add_reason')" size="md">
      <div class="space-y-4">
        <div>
          <label class="label">{{ $t('admin.reason_name_en') }} <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" class="input" maxlength="255" />
        </div>
        <div>
          <label class="label">{{ $t('admin.reason_name_ar') }}</label>
          <input v-model="form.name_ar" type="text" class="input" dir="rtl" maxlength="255" />
        </div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.is_active" type="checkbox" class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
          <span class="text-sm text-gray-700">{{ $t('admin.reason_active') }}</span>
        </label>
      </div>

      <template #footer>
        <button class="btn-secondary" @click="showForm = false">{{ $t('common.cancel') }}</button>
        <button class="btn-primary" :disabled="saving || !form.name.trim()" @click="save">
          <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
          {{ $t('common.save') }}
        </button>
      </template>
    </AppModal>

    <!-- Delete confirm modal -->
    <AppModal v-model="showDelete" :title="$t('admin.delete_reason')" size="sm">
      <p class="text-sm text-gray-600">
        {{ $t('admin.confirm_delete_reason', { name: deleting?.name }) }}
      </p>
      <template #footer>
        <button class="btn-secondary" @click="showDelete = false">{{ $t('common.cancel') }}</button>
        <button class="btn-danger" :disabled="saving" @click="doDelete">
          <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
          {{ $t('common.delete') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AppModal from '@/components/common/AppModal.vue'
import { adminService } from '@/services/adminService'

const { t, locale } = useI18n()
const toast = useToast()

const reasons = ref([])
const loading = ref(false)
const saving  = ref(false)
const isRtl   = computed(() => locale.value === 'ar')

const showForm = ref(false)
const editing  = ref(null)
const form     = ref({ name: '', name_ar: '', is_active: true })

const showDelete = ref(false)
const deleting   = ref(null)

async function fetchReasons() {
  loading.value = true
  try {
    const res = await adminService.getReasons()
    if (res.success) {
      reasons.value = res.data.map((r) => ({ ...r, busy: false }))
    }
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.value = { name: '', name_ar: '', is_active: true }
  showForm.value = true
}

function openEdit(r) {
  editing.value = r
  form.value = { name: r.name, name_ar: r.name_ar || '', is_active: r.is_active }
  showForm.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      name_ar: form.value.name_ar.trim() || null,
      is_active: form.value.is_active,
    }
    const res = editing.value
      ? await adminService.updateReason(editing.value.id, payload)
      : await adminService.createReason(payload)
    if (res.success) {
      toast.success(res.message)
      showForm.value = false
      await fetchReasons()
    }
  } catch (e) {
    toast.error(e.response?.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}

async function toggleActive(r) {
  r.busy = true
  try {
    const res = await adminService.updateReason(r.id, { is_active: !r.is_active })
    if (res.success) {
      r.is_active = res.data.is_active
      toast.success(res.message)
    }
  } catch (e) {
    toast.error(e.response?.data?.message || t('common.error'))
  } finally {
    r.busy = false
  }
}

function confirmDelete(r) {
  deleting.value = r
  showDelete.value = true
}

async function doDelete() {
  saving.value = true
  try {
    const res = await adminService.deleteReason(deleting.value.id)
    if (res.success) {
      toast.success(res.message)
      showDelete.value = false
      await fetchReasons()
    }
  } catch (e) {
    toast.error(e.response?.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}

onMounted(fetchReasons)
</script>
