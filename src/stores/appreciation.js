import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appreciationService } from '@/services/appreciationService'

export const useAppreciationStore = defineStore('appreciation', () => {
  const dashboard   = ref(null)
  const received    = ref([])
  const sent        = ref([])
  const feed        = ref([])
  const loading     = ref(false)
  const sendLoading = ref(false)
  const meta        = ref({})

  async function fetchDashboard() {
    loading.value = true
    try {
      const res = await appreciationService.getDashboard()
      if (res.success) {
        dashboard.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchReceived(params = {}) {
    loading.value = true
    try {
      const res = await appreciationService.getReceived(params)
      if (res.success) {
        received.value = res.data
        meta.value     = res.meta
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchSent(params = {}) {
    loading.value = true
    try {
      const res = await appreciationService.getSent(params)
      if (res.success) {
        sent.value = res.data
        meta.value = res.meta
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchFeed(params = {}) {
    loading.value = true
    try {
      const res = await appreciationService.getFeed(params)
      if (res.success) {
        feed.value = res.data
        meta.value = res.meta
      }
    } finally {
      loading.value = false
    }
  }

  async function sendAppreciation(payload) {
    sendLoading.value = true
    try {
      const res = await appreciationService.send(payload)
      if (res.success && dashboard.value) {
        dashboard.value.stats.monthly_sent++
        dashboard.value.stats.total_sent++
        dashboard.value.stats.monthly_remaining = Math.max(0, dashboard.value.stats.monthly_remaining - 1)
      }
      return res
    } finally {
      sendLoading.value = false
    }
  }

  return { dashboard, received, sent, feed, loading, sendLoading, meta, fetchDashboard, fetchReceived, fetchSent, fetchFeed, sendAppreciation }
})
