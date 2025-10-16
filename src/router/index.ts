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
        meta: { title: '总览' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'reservations',
        name: 'Reservations',
        component: () => import('../views/Reservations.vue'),
        meta: { title: '预约管理' },
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('../views/Courses.vue'),
        meta: { title: '课程管理' },
      },
      {
        path: 'semesters',
        name: 'Semesters',
        component: () => import('../views/Semesters.vue'),
        meta: { title: '学期管理' },
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: () => import('../views/Rooms.vue'),
        meta: { title: '教室管理' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true, title: '登录' },
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

  if (authStore.isAuthenticated && to.path === '/login') {
    return { path: '/' }
  }

  if (to.meta.title && typeof document !== 'undefined') {
    document.title = `${to.meta.title} · iDesignLab Admin`
  }

  return true
})

export default router
