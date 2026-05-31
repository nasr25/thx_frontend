<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">{{ $t('admin.appreciation_management') }}</h1>
    </div>

    <div class="card">
      <LoadingSpinner v-if="loading" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-start text-gray-500 border-b border-gray-100">
              <th class="pb-3 font-medium">{{ $t('appreciation.from') }}</th>
              <th class="pb-3 font-medium">{{ $t('appreciation.to') }}</th>
              <th class="pb-3 font-medium hidden md:table-cell">Message</th>
              <th class="pb-3 font-medium hidden sm:table-cell">Date</th>
              <th class="pb-3 font-medium text-end">{{ $t('common.delete') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in appreciations" :key="item.id" class="hover:bg-gray-50">
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
                    {{ item.sender?.full_name?.[0] }}
                  </div>
                  <span class="font-medium text-gray-900">{{ item.sender?.full_name }}</span>
                </div>
              </td>
              <td class="py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs shrink-0">
                    {{ item.receiver?.full_name?.[0] }}
                  </div>
                  <span class="font-medium text-gray-900">{{ item.receiver?.full_name }}</span>
                </div>
              </td>
              <td class="py-3 hidden md:table-cell max-w-[200px]">
                <span v-if="item.message" class="text-gray-600 truncate block">{{ item.message }}</span>
                <span v-else class="text-gray-400 italic text-xs">No message</span>
              </td>
              <td class="py-3 hidden sm:table-cell text-gray-500 whitespace-nowrap">
                {{ new Date(item.created_at).toLocaleDateString() }}
              </td>
              <td class="py-3 text-end">
                <button
                  @click="openDeleteModal(item)"
                  class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Modal -->
    <AppModal v-model="showDeleteModal" :title="$t('admin.confirm_delete')" size="sm">
      <div class="space-y-4">
        <p class="text-gray-600 text-sm">Are you sure you want to delete this appreciation?</p>
        <div>
          <label class="label">{{ $t('admin.delete_reason') }}</label>
          <input v-model="deleteReason" type="text" class="input" placeholder="Optional reason..." />
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
        <button class="btn-danger" @click="confirmDelete" :disabled="deleting">
          <ArrowPathIcon v-if="deleting" class="w-4 h-4 animate-spin" />
          {{ $t('common.delete') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AppModal      from '@/components/common/AppModal.vue'
import { adminService } from '@/services/adminService'

const toast = useToast()

const appreciations    = ref([])
const loading          = ref(false)
const showDeleteModal  = ref(false)
const selectedItem     = ref(null)
const deleteReason     = ref('')
const deleting         = ref(false)

async function fetchAppreciations() {
  loading.value = true
  try {
    const res = await adminService.getAppreciations()
    if (res.success) appreciations.value = res.data
  } finally {
    loading.value = false
  }
}

function openDeleteModal(item) {
  selectedItem.value  = item
  deleteReason.value  = ''
  showDeleteModal.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await adminService.deleteAppreciation(selectedItem.value.id, deleteReason.value)
    appreciations.value = appreciations.value.filter((a) => a.id !== selectedItem.value.id)
    toast.success('Appreciation deleted.')
    showDeleteModal.value = false
  } catch {
    toast.error('Failed to delete.')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchAppreciations)
</script>
