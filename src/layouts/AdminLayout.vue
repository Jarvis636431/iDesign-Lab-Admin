<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import {
  Odometer,
  Tickets,
  UserFilled,
} from '@element-plus/icons-vue'

const route = useRoute()

const menuItems = computed(() => [
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
    label: '工单管理',
    path: '/tickets',
    icon: Tickets,
  },
])
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

.admin-main {
  padding: 1.5rem 2rem;
  background-color: #f5f7fa;
}
</style>
