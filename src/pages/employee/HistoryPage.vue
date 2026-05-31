<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">{{ $t('history.title') }}</h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="activeTab === tab.key ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <!-- Received tab -->
    <div v-else-if="activeTab === 'received'">
      <div v-if="received.length === 0" class="card py-16 text-center">
        <span class="text-5xl block mb-4">⭐</span>
        <p class="text-gray-500">{{ $t('history.no_received') }}</p>
      </div>
      <div v-else class="card space-y-2">
        <AppreciationItem v-for="item in received" :key="item.id" :appreciation="item" />
      </div>
    </div>

    <!-- Sent tab -->
    <div v-else>
      <div v-if="sent.length === 0" class="card py-16 text-center">
        <span class="text-5xl block mb-4">⭐</span>
        <p class="text-gray-500">{{ $t('history.no_sent') }}</p>
      </div>
      <div v-else class="card space-y-2">
        <div v-for="item in sent" :key="item.id" class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
          <RouterLink :to="`/employees/${item.receiver?.id}`">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
              {{ item.receiver?.display_name?.[0] || '?' }}
            </div>
          </RouterLink>
          <div class="flex-1">
            <div class="flex items-center gap-1">
              <span class="text-xs text-gray-400">{{ $t('appreciation.to') }}</span>
              <RouterLink :to="`/employees/${item.receiver?.id}`" class="text-sm font-semibold text-gray-900 hover:text-indigo-600">
                {{ item.receiver?.display_name || item.receiver?.full_name }}
              </RouterLink>
            </div>
            <p v-if="item.message" class="text-sm text-gray-600 mt-0.5">"{{ item.message }}"</p>
            <p v-else class="text-sm text-gray-400 italic">{{ $t('appreciation.no_message') }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ item.formatted_date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LoadingSpinner    from '@/components/common/LoadingSpinner.vue'
import AppreciationItem  from '@/components/employee/AppreciationItem.vue'
import { useAppreciationStore } from '@/stores/appreciation'

const { t }     = useI18n()
const apprStore = useAppreciationStore()
const activeTab = ref('received')

const tabs = computed(() => [
  { key: 'received', label: t('history.received') },
  { key: 'sent',     label: t('history.sent') },
])

const loading  = computed(() => apprStore.loading)
const received = computed(() => apprStore.received)
const sent     = computed(() => apprStore.sent)

watch(activeTab, (tab) => {
  if (tab === 'received') apprStore.fetchReceived()
  else apprStore.fetchSent()
})

onMounted(() => apprStore.fetchReceived())
</script>
