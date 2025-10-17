<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  Odometer,
  UserFilled,
  Calendar,
  Collection,
  Timer,
  OfficeBuilding,
  ArrowDown,
  Setting,
  User,
} from '@element-plus/icons-vue'
import { ElMessageBox, ElDropdown } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { user: currentUser, isAuthenticated } = storeToRefs(authStore)
const brandLogo = new URL('../assets/logo.png', import.meta.url).href
const isSidebarCollapsed = ref(false)

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
  ElMessageBox.confirm('确认退出当前账号吗？', '退出登录', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      authStore.logout()
      router.push({ path: '/login' })
    })
    .catch(() => {})
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/settings')
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-info">
          <img :src="brandLogo" alt="iDesign Lab" class="brand-logo" />
          <div class="brand-text">
            <span class="brand-mark">iDesign Lab</span>
            <span class="brand-sub">实验室管理系统</span>
          </div>
        </div>
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
        <div class="user-dropdown-container">
          <el-dropdown 
            class="user-dropdown" 
            :hide-on-click="true"
            trigger="click"
          >
            <div class="user-trigger">
              <div class="user-details">
                <div class="user-name">{{ displayName }}</div>
                <div class="user-role">{{ roleDisplay }}</div>
              </div>
              <el-icon class="arrow-icon">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="User" @click="goToProfile">
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item :icon="Setting" @click="goToSettings">
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout" :icon="UserFilled">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </footer>
    </el-aside>
    <el-main class="admin-main">
      <div class="admin-content">
        <RouterView />
      </div>
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
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 1.25rem 1.5rem;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.brand-mark {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.brand-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.05em;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu) {
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  margin: 0 12px;
  height: 44px;
  line-height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  color: rgba(255, 255, 255, 0.85);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item:focus-visible) {
  background-color: rgba(255, 255, 255, 0.12);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.32), rgba(64, 158, 255, 0.14));
  color: #fff;
  position: relative;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 2px;
  background: #409eff;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-dropdown-container {
  width: 100%;
}

.user-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.arrow-icon {
  transition: transform 0.3s;
}

.user-trigger:hover .arrow-icon {
  transform: rotate(180deg);
}

.admin-main {
  display: flex;
  flex: 1;
  padding: 0;
  background-color: #f5f7fa;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  height: 100%;
  padding: 1.5rem 2rem;
  overflow: auto;
}
</style>
.user-avatar :deep(.el-avatar__inner) {
  font-weight: 600;
}
