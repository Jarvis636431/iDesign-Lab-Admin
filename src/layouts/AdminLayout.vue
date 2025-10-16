<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  Odometer,
  UserFilled,
  Calendar,
  Collection,
  Timer,
  OfficeBuilding,
  Avatar,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { user: currentUser, isAuthenticated } = storeToRefs(authStore)

const menuItems = computed(() => {
  if (!isAuthenticated.value) return []
  return [
    {
      label: '仪表盘',
      path: '/',
      icon: Odometer,
    },
    {
      label: '用户管理',
      path: '/users',
      icon: UserFilled,
    },
    {
      label: '预约管理',
      path: '/reservations',
      icon: Calendar,
    },
    {
      label: '课程管理',
      path: '/courses',
      icon: Collection,
    },
    {
      label: '学期管理',
      path: '/semesters',
      icon: Timer,
    },
    {
      label: '教室管理',
      path: '/rooms',
      icon: OfficeBuilding,
    },
  ]
})

const roleDisplay = computed(() => {
  const role = currentUser.value?.Role
  const map: Record<string, string> = {
    admin: '管理员',
    teacher: '教师',
    student: '学生',
    temporary: '临时用户',
  }
  if (role && map[role]) return map[role]
  return '未知角色'
})

const displayName = computed(() => currentUser.value?.Name || '访客用户')

const userInitials = computed(() => {
  const name = currentUser.value?.Name ?? ''
  if (!name) return '访客'
  return name.length === 1 ? name : name.slice(0, 2)
})

const handleLogout = () => {
  authStore.logout()
  router.push({ path: '/login' })
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-sidebar">
      <div class="sidebar-brand">
        <span class="brand-mark">iDesignLab</span>
        <span class="brand-sub">Admin</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="sidebar-menu"
        router
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <footer class="sidebar-footer" v-if="currentUser">
        <div class="user-meta">
          <el-avatar class="user-avatar" :size="40">
            <template v-if="currentUser?.Name">
              {{ userInitials }}
            </template>
            <template v-else>
              <Avatar />
            </template>
          </el-avatar>
          <div class="user-info">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-role">{{ roleDisplay }}</span>
          </div>
        </div>
        <el-button
          class="logout-btn"
          type="primary"
          plain
          size="small"
          @click="handleLogout"
        >
          退出登录
        </el-button>
      </footer>
    </el-aside>
    <el-main class="admin-main">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #1f2d3d;
  color: #fff;
  padding: 1rem 0;
  box-shadow: 2px 0 12px rgba(15, 23, 42, 0.2);
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1.5rem 1rem;
  gap: 0.25rem;
}

.brand-mark {
  font-size: 1.125rem;
  font-weight: 600;
}

.brand-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.logout-btn {
  align-self: stretch;
}

.admin-main {
  padding: 1.5rem 2rem;
  background-color: #f5f7fa;
}
</style>
.user-avatar :deep(.el-avatar__inner) {
  font-weight: 600;
}
