<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { User } from '../types/user';

interface MenuItem {
  label: string;
  path: string;
  icon: unknown;
}

defineProps<{
  brandLogo: string;
  menuItems: MenuItem[];
  currentUser: User | null;
  displayName: string;
  roleDisplay: string;
}>();

const emit = defineEmits<{
  'open-settings': [];
}>();

const route = useRoute();

const sidebarClass = computed(() => ({
  'admin-sidebar': true,
}));
const handleOpenSettings = () => emit('open-settings');
</script>

<template>
  <el-aside width="220px" :class="sidebarClass">
    <div class="sidebar-brand">
      <div class="brand-info">
        <img :src="brandLogo" alt="iDesign Lab" class="brand-logo" />
        <div class="brand-text">
          <span class="brand-mark">iDesign Lab</span>
          <span class="brand-sub">实验室管理系统</span>
        </div>
      </div>
    </div>

    <div class="sidebar-menu-wrapper">
      <el-menu :default-active="route.path" class="sidebar-menu" router>
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon class="menu-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="menu-label">{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <footer class="sidebar-footer" v-if="currentUser">
      <div class="user-section">
        <div class="user-trigger" @click="handleOpenSettings">
          <div class="user-details">
            <div class="user-name-role">
              {{ displayName }} ({{ roleDisplay }})
            </div>
          </div>
        </div>
      </div>
    </footer>
  </el-aside>
</template>

<style scoped>
.admin-sidebar {
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(180deg, #0b1b2a 0%, #0f2538 50%, #0b1a2a 100%);
  color: #e2e8f0;
  padding: 1rem 0;
  box-shadow: 6px 0 24px rgba(2, 8, 23, 0.35);
  overflow: hidden;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  --sidebar-accent: #38bdf8;
  --sidebar-accent-soft: rgba(56, 189, 248, 0.18);
  --sidebar-surface: rgba(255, 255, 255, 0.06);
  --sidebar-muted: rgba(226, 232, 240, 0.65);
}

.admin-sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 16% 8%,
      rgba(56, 189, 248, 0.15),
      transparent 45%
    ),
    radial-gradient(
      circle at 90% 20%,
      rgba(45, 212, 191, 0.12),
      transparent 40%
    );
  pointer-events: none;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  padding: 0 1.25rem 1.5rem;
  position: relative;
  z-index: 1;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.2),
    rgba(45, 212, 191, 0.12)
  );
  padding: 0.5rem;
  box-shadow: 0 10px 20px rgba(2, 8, 23, 0.35);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.brand-mark {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.brand-sub {
  font-size: 0.75rem;
  color: var(--sidebar-muted);
  letter-spacing: 0.05em;
}

.sidebar-menu-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  z-index: 1;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 0 0.35rem;
}

.sidebar-menu :deep(.el-menu) {
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  margin: 8px 8px;
  height: 46px;
  line-height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  padding: 0 14px;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  color: rgba(226, 232, 240, 0.8);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item:focus-visible) {
  background-color: var(--sidebar-surface);
  transform: translateX(4px);
  box-shadow: 0 8px 18px rgba(2, 8, 23, 0.25);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.3),
    rgba(45, 212, 191, 0.2)
  );
  color: #fff;
  box-shadow: 0 10px 22px rgba(2, 8, 23, 0.35);
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #fff;
}

.menu-label {
  flex: 1;
  text-align: left;
  white-space: nowrap;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 72px;
  padding: 1.25rem 1.25rem 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  position: relative;
  z-index: 1;
}

.user-section {
  flex: 1;
}

.user-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.user-trigger:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(56, 189, 248, 0.35);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name-role {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(226, 232, 240, 0.92);
}

.admin-sidebar .brand-text,
.admin-sidebar .menu-label,
.admin-sidebar .user-details {
  transition: opacity 0.2s ease;
}

.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.2);
  border-radius: 999px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
</style>
