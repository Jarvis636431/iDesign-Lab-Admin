<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import {
  Odometer,
  UserFilled,
  Calendar,
  Collection,
  Timer,
  OfficeBuilding,
} from '@element-plus/icons-vue';
import { ElMessageBox} from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';
import AdminSidebar from '../components/AdminSidebar.vue';

const router = useRouter();
const authStore = useAuthStore();
const { user: currentUser, isAuthenticated } = storeToRefs(authStore);
const brandLogo = new URL('../assets/logo.png', import.meta.url).href;

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

const showProfileSettings = ref(false);
const activeTab = ref('profile'); // 'profile' or 'settings'
const theme = ref<'light' | 'dark'>('light');
const language = ref('zh-CN'); // 'zh-CN' or 'en-US'

// 初始化主题
const applyTheme = (value: 'light' | 'dark') => {
  theme.value = value;
  localStorage.setItem('app-theme', value);
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


const changeLanguage = (lang: string) => {
  language.value = lang;
  localStorage.setItem('app-language', lang);
  // 可以在这里添加国际化切换逻辑
};
</script>

<template>
  <el-container class="admin-layout">
    <AdminSidebar
      :brand-logo="brandLogo"
      :menu-items="menuItems"
      :current-user="currentUser"
      :display-name="displayName"
      :role-display="roleDisplay"
      @open-settings="showProfileSettings = true"
    />
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
                @change="applyTheme"
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
