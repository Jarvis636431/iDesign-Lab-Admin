<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import {
  Odometer,
  UserFilled,
  Calendar,
  Collection,
  Timer,
  OfficeBuilding,
  Expand,
  Fold,
} from '@element-plus/icons-vue';
import { ElMessageBox} from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { user: currentUser, isAuthenticated } = storeToRefs(authStore);
const brandLogo = new URL('../assets/logo.png', import.meta.url).href;
const isSidebarCollapsed = ref(false);

const menuItems = computed(() => {
  if (!isAuthenticated.value) return [];
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
      path: '/labs',
      icon: OfficeBuilding,
    },
  ];
});

const roleDisplay = computed(() => {
  const role = currentUser.value?.Role;
  const map: Record<string, string> = {
    admin: '管理员',
    teacher: '教师',
    student: '学生',
    temporary: '临时用户',
  };
  if (role && map[role]) return map[role];
  return '未知角色';
});

const displayName = computed(() => currentUser.value?.Name || '访客用户');

const handleLogout = () => {
  ElMessageBox.confirm('确认退出当前账号吗？', '退出登录', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      authStore.logout();
      router.push({ path: '/login' });
    })
    .catch(() => {});
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const showProfileSettings = ref(false);
const activeTab = ref('profile'); // 'profile' or 'settings'
const theme = ref<'light' | 'dark'>('light');
const language = ref('zh-CN'); // 'zh-CN' or 'en-US'

// 初始化主题
const applyTheme = (value: 'light' | 'dark') => {
  theme.value = value;
  if (value === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
};

onMounted(() => {
  const savedTheme = (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light';
  const savedLanguage = localStorage.getItem('app-language');
  applyTheme(savedTheme);
  if (savedLanguage) {
    language.value = savedLanguage;
  }
});

const saveSettings = () => {
  // 保存设置到本地存储
  localStorage.setItem('app-theme', theme.value);
  localStorage.setItem('app-language', language.value);
  showProfileSettings.value = false;
};

const getRoleTagType = computed(() => {
  const role = currentUser.value?.Role;
  if (role === 'admin') return 'danger';
  if (role === 'teacher') return 'warning';
  if (role === 'student') return 'success';
  if (role === 'temporary') return 'info';
  return 'info';
});

const toggleTheme = () => {
  applyTheme(theme.value);
};

const changeLanguage = (lang: string) => {
  language.value = lang;
  // 可以在这里添加国际化切换逻辑
};
</script>

<template>
  <el-container class="admin-layout">
    <el-aside
      :width="isSidebarCollapsed ? '64px' : '220px'"
      class="admin-sidebar"
    >
      <div class="sidebar-brand">
        <div class="brand-info">
          <img :src="brandLogo" alt="iDesign Lab" class="brand-logo" />
          <div class="brand-text" v-show="!isSidebarCollapsed">
            <span class="brand-mark">iDesign Lab</span>
            <span class="brand-sub">实验室管理系统</span>
          </div>
        </div>
      </div>
      <el-menu :default-active="route.path" class="sidebar-menu" router>
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          :class="isSidebarCollapsed ? 'collapsed' : ''"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <footer class="sidebar-footer" v-if="currentUser">
        <div class="user-section" v-show="!isSidebarCollapsed">
          <div class="user-trigger" @click="showProfileSettings = true">
            <div class="user-details">
              <div class="user-name-role">
                {{ displayName }} ({{ roleDisplay }})
              </div>
            </div>
          </div>
        </div>

        <el-button
          class="collapse-btn"
          :icon="isSidebarCollapsed ? Expand : Fold"
          @click="toggleSidebar"
          text
          size="large"
        />
      </footer>
    </el-aside>
    <el-main class="admin-main">
      <div class="admin-content">
        <RouterView />
      </div>
    </el-main>

    <!-- 个人资料和设置弹窗 -->
    <el-dialog
      v-model="showProfileSettings"
      width="500px"
      :modal="true"
      :show-close="true"
      class="profile-settings-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <el-tabs v-model="activeTab" class="profile-settings-tabs">
            <el-tab-pane label="个人资料" name="profile"></el-tab-pane>
            <el-tab-pane label="系统设置" name="settings"></el-tab-pane>
          </el-tabs>
        </div>
      </template>

      <div class="dialog-content">
        <!-- 个人资料标签页 -->
        <div v-if="activeTab === 'profile'" class="profile-content">
          <div class="profile-header">
            <div class="profile-basic-info">
              <div class="name-role-container">
                <h3 class="user-name">{{ displayName }}</h3>
                <el-tag size="small" :type="getRoleTagType" class="role-tag">{{
                  roleDisplay
                }}</el-tag>
              </div>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-item">
              <span class="label">账号</span>
              <span class="value">{{ currentUser?.Account || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">手机号</span>
              <span class="value">{{ currentUser?.Phone || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- 系统设置标签页 -->
        <div v-if="activeTab === 'settings'" class="settings-content">
          <div class="settings-options">
            <div class="setting-item">
              <span class="setting-label">主题模式</span>
<el-switch
                v-model="theme"
                active-value="dark"
                inactive-value="light"
                @change="toggleTheme"
                inline-prompt
                :active-text="theme === 'dark' ? '黑夜' : '白天'"
                :inactive-text="theme === 'dark' ? '黑夜' : '白天'"
              />
            </div>

            <div class="setting-item">
              <span class="setting-label">语言</span>
              <el-select
                v-model="language"
                placeholder="选择语言"
                @change="changeLanguage"
                style="width: 100%"
              >
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showProfileSettings = false">取消</el-button>
          <el-button
            v-if="activeTab === 'profile'"
            type="danger"
            @click="handleLogout"
          >
            退出登录
          </el-button>
          <el-button v-else type="primary" @click="saveSettings">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #1f2d3d;
  color: #fff;
  padding: 1rem 0;
  box-shadow: 2px 0 12px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.25rem 1.5rem;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
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
  margin: 8px 12px;
  height: 44px;
  line-height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  padding: 0 16px;
}

.sidebar-menu :deep(.el-menu-item.collapsed) {
  justify-content: center;
  padding: 0;
}

.sidebar-menu :deep(.el-menu-item span) {
  flex: 1;
  text-align: left;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  color: rgba(255, 255, 255, 0.85);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item:focus-visible) {
  background-color: rgba(255, 255, 255, 0.12);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2);
  color: #fff;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-section {
  flex: 1;
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

.collapse-btn {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.collapse-btn:active {
  transform: scale(0.95);
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

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 14px;
  color: #606266;
}

.profile-settings-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.profile-settings-tabs :deep(.el-tabs__header) {
  padding: 0 20px;
  margin: 0;
}

.profile-settings-tabs :deep(.el-tabs__nav-wrap)::after {
  height: 1px;
}

.dialog-content {
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.profile-basic-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.name-role-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  margin: 0;
}

.role-tag {
  height: 24px;
  line-height: 22px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #909399;
  font-size: 14px;
}

.detail-item .value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid #eee;
}

.dialog-header {
  border-bottom: 1px solid #eee;
}

.user-avatar :deep(.el-avatar__inner) {
  font-weight: 600;
}
</style>
