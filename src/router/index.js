import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ── Admin Login (only page with a form) ───────────────────────────────────
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/pages/auth/AdminLoginPage.vue'),
    meta: { requiresGuest: true, layout: 'auth' },
  },

  // ── Employee & shared pages (Windows Auth — no form login) ────────────────
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/employee/DashboardPage.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/employees',
    name: 'employees',
    component: () => import('@/pages/employee/SearchPage.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/employees/:id',
    name: 'employee-profile',
    component: () => import('@/pages/employee/ProfilePage.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/pages/employee/NotificationsPage.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/pages/employee/HistoryPage.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/employee/SettingsPage.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },

  // ── Admin Panel ───────────────────────────────────────────────────────────
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/pages/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('@/pages/admin/PlatformSettings.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
  },
  {
    path: '/admin/appreciations',
    name: 'admin-appreciations',
    component: () => import('@/pages/admin/AppreciationManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
  },
  {
    path: '/admin/activity-logs',
    name: 'admin-activity-logs',
    component: () => import('@/pages/admin/ActivityLogs.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
  },
  {
    path: '/admin/analytics',
    name: 'admin-analytics',
    component: () => import('@/pages/admin/Analytics.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
  },

  // ── Loading screen (shown while Windows Auth is in progress) ──────────────
  {
    path: '/authenticating',
    name: 'authenticating',
    component: () => import('@/pages/auth/AuthenticatingPage.vue'),
    meta: { layout: 'auth' },
  },

  // ── Catch-all ────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Guest-only page (admin login) — redirect to admin dashboard if already logged in
  if (to.meta.requiresGuest) {
    if (auth.isAuthenticated && auth.isAdmin) {
      return next({ name: 'admin-dashboard' })
    }
    return next()
  }

  // Admin panel requires admin role
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) {
      return next({ name: 'admin-login' })
    }
    if (!auth.isAdmin) {
      return next({ name: 'dashboard' })
    }
    return next()
  }

  // Employee pages: if already authenticated, pass through
  if (to.meta.requiresAuth) {
    if (auth.isAuthenticated) {
      return next()
    }
    // Not authenticated — let App.vue handle Windows Auth; go to loading screen
    return next({ name: 'authenticating', query: { redirect: to.fullPath } })
  }

  next()
})

export default router
