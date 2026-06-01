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
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/pages/admin/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
  },
  {
    path: '/admin/reasons',
    name: 'admin-reasons',
    component: () => import('@/pages/admin/ReasonManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, requiresSuperAdmin: true, layout: 'admin' },
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

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Already heading to an auth page — always allow (prevents redirect loops)
  if (['admin-login', 'authenticating'].includes(to.name)) {
    return next()
  }

  // Admin-only: redirect unauthenticated to admin login, non-admins to dashboard
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) return next({ name: 'admin-login' })
    if (!auth.isAdmin)         return next({ name: 'dashboard' })
    // Super-admin-only pages (e.g. reason management): regular admins bounce to the admin dashboard.
    if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) return next({ name: 'admin-dashboard' })
    return next()
  }

  // Guest-only (admin login shown): redirect if already authenticated as admin
  if (to.meta.requiresGuest) {
    if (auth.isAuthenticated && auth.isAdmin) return next({ name: 'admin-dashboard' })
    return next()
  }

  // Protected employee pages
  if (to.meta.requiresAuth) {
    if (auth.isAuthenticated) return next()
    // Not authenticated — send to /authenticating which tries Windows Auth once
    return next({ name: 'authenticating', query: { redirect: to.fullPath } })
  }

  next()
})

export default router
