import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'tickets',
        name: 'Tickets',
        component: () => import('../views/Tickets.vue'),
        meta: { title: '工单管理' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { public: true, title: '注册' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    try {
      await authStore.fetchCurrentUser()
    } catch (error) {
      if (!to.meta.public) {
        return {
          path: '/login',
          query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
        }
      }
    }
  }

  if (!authStore.isAuthenticated && !to.meta.public) {
    return {
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  if (authStore.isAuthenticated && ['/login', '/register'].includes(to.path)) {
    return { path: '/' }
  }

  if (to.meta.title && typeof document !== 'undefined') {
    document.title = `${to.meta.title} · iDesignLab Admin`
  }

  return true
})

export default router
