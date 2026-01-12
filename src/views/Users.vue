<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { getManagedUsers, updateManagedUserStatus } from '../services/user';
import type {
  ManagedUsersResponse,
  ManagementScope,
  User,
  UserStatus,
} from '../types/user';

type RoleTab = 'student' | 'temporary';
type StatusFilter = UserStatus | 'all';

interface DisplayUser extends User {
  __status: UserStatus;
}

const authStore = useAuthStore();
const { user: currentUser } = storeToRefs(authStore);

const scope = computed<ManagementScope | null>(() => {
  if (currentUser.value?.Role === 'admin') return 'admin';
  if (currentUser.value?.Role === 'teacher') return 'teacher';
  return null;
});

const loading = ref(false);
const actionLoading = ref(false);
const managed = ref<ManagedUsersResponse | null>(null);
const activeRole = ref<RoleTab>('student');
const activeStatus = ref<StatusFilter>('pending');
const selectedRows = ref<DisplayUser[]>([]);

const statusOptions: Array<{ value: UserStatus; label: string; type: string }> =
  [
    { value: 'pending', label: '待审核', type: 'warning' },
    { value: 'approved', label: '已通过', type: 'success' },
    { value: 'rejected', label: '已驳回', type: 'info' },
    { value: 'banned', label: '已封禁', type: 'danger' },
  ];

const fetchManaged = async () => {
  if (!scope.value) return;
  loading.value = true;
  try {
    const data = await getManagedUsers(scope.value);
    managed.value = data;
  } catch {
    ElMessage.error('获取用户列表失败，请稍后重试');
    managed.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  scope,
  (value) => {
    if (value) {
      fetchManaged();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (scope.value) fetchManaged();
});

watch(activeRole, () => {
  activeStatus.value = 'pending';
  resetSelection();
});

watch(managed, () => {
  resetSelection();
});

const currentBuckets = computed(() => {
  if (!managed.value) return null;
  return managed.value[activeRole.value];
});

const statusCounts = computed<Record<UserStatus, number>>(() => {
  const buckets = currentBuckets.value;
  if (!buckets) {
    return {
      pending: 0,
      approved: 0,
      rejected: 0,
      banned: 0,
    };
  }
  return {
    pending: buckets.pending.length,
    approved: buckets.approved.length,
    rejected: buckets.rejected.length,
    banned: buckets.banned.length,
  };
});

const tableData = computed<DisplayUser[]>(() => {
  const buckets = currentBuckets.value;
  if (!buckets) return [];
  const statuses: UserStatus[] =
    activeStatus.value === 'all'
      ? ['pending', 'approved', 'rejected', 'banned']
      : [activeStatus.value as UserStatus];

  return statuses.flatMap((status) =>
    (buckets[status] ?? []).map((user) => ({
      ...user,
      __status: status,
    }))
  );
});

const selectedIds = computed(() => selectedRows.value.map((row) => row.ID));

const handleSelectionChange = (rows: DisplayUser[]) => {
  selectedRows.value = rows;
};

const resetSelection = () => {
  selectedRows.value = [];
};

const confirmAndUpdateStatus = async (
  ids: number[],
  status: UserStatus,
  options?: { requireReason?: boolean; message?: string }
) => {
  if (!scope.value) {
    ElMessage.warning('当前账号无权操作用户状态');
    return;
  }
  if (!ids.length) {
    ElMessage.warning('请先选择用户');
    return;
  }

  const requireReason = options?.requireReason ?? false;
  const promptMessage =
    options?.message ??
    `确认将选中用户状态调整为「${statusOptions.find((item) => item.value === status)?.label ?? status}」吗？`;

  let reason: string | undefined;

  try {
    if (requireReason) {
      const { value } = await ElMessageBox.prompt(promptMessage, '请输入原因', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPlaceholder: '请填写原因（可选）',
        inputType: 'textarea',
      });
      reason = value?.trim() || undefined;
    } else {
      await ElMessageBox.confirm(promptMessage, '确认操作', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      });
    }
  } catch {
    return;
  }

  actionLoading.value = true;
  try {
    await updateManagedUserStatus(scope.value, {
      user_ids: ids,
      status,
      reason,
    });
    ElMessage.success('用户状态更新成功');
    resetSelection();
    fetchManaged();
  } catch {
    ElMessage.error('用户状态更新失败，请稍后重试');
  } finally {
    actionLoading.value = false;
  }
};

const handleRowAction = (row: DisplayUser, status: UserStatus) => {
  const requireReason = status === 'rejected' || status === 'banned';
  confirmAndUpdateStatus([row.ID], status, { requireReason });
};

const handleBatchAction = (status: UserStatus, message?: string) => {
  const requireReason = status === 'rejected' || status === 'banned';
  confirmAndUpdateStatus(selectedIds.value, status, { requireReason, message });
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : '—';
};

const noPermission = computed(() => !scope.value);
</script>

<template>
  <section class="users-page">
    <header class="page-header">
      <div>
        <h1>用户管理</h1>
        <p>教师与管理员可以在此审批、封禁或解封学生与临时账号。</p>
      </div>
      <el-tag v-if="scope" type="success" effect="dark">
        当前操作身份：{{ scope === 'admin' ? '管理员' : '教师' }}
      </el-tag>
    </header>

    <el-result
      v-if="noPermission"
      icon="warning"
      title="无权限访问"
      sub-title="仅教师或管理员可进入用户管理，请联系管理员开通权限。"
    />

    <template v-else>
      <el-card>
        <template #header>
          <el-space wrap size="large">
            <div class="summary-item">
              <span class="summary-count">{{ statusCounts.pending }}</span>
              <span class="summary-label">待审核</span>
            </div>
            <div class="summary-item">
              <span class="summary-count">{{ statusCounts.approved }}</span>
              <span class="summary-label">已通过</span>
            </div>
            <div class="summary-item">
              <span class="summary-count">{{ statusCounts.rejected }}</span>
              <span class="summary-label">已驳回</span>
            </div>
            <div class="summary-item">
              <span class="summary-count">{{ statusCounts.banned }}</span>
              <span class="summary-label">已封禁</span>
            </div>
          </el-space>
        </template>

        <el-tabs v-model="activeRole" class="role-tabs">
          <el-tab-pane label="学生" name="student" />
          <el-tab-pane label="临时用户" name="temporary" />
        </el-tabs>

        <div class="filters-bar">
          <el-space wrap>
            <el-radio-group v-model="activeStatus">
              <el-radio-button label="pending">待审核</el-radio-button>
              <el-radio-button label="approved">已通过</el-radio-button>
              <el-radio-button label="rejected">已驳回</el-radio-button>
              <el-radio-button label="banned">已封禁</el-radio-button>
              <el-radio-button label="all">全部</el-radio-button>
            </el-radio-group>
          </el-space>

          <el-space wrap>
            <el-button
              :loading="actionLoading"
              type="success"
              @click="handleBatchAction('approved', '确认通过选中用户吗？')"
            >
              批量通过
            </el-button>
            <el-button
              :loading="actionLoading"
              type="warning"
              @click="handleBatchAction('rejected')"
            >
              批量驳回
            </el-button>
            <el-button
              :loading="actionLoading"
              type="danger"
              @click="handleBatchAction('banned')"
            >
              批量封禁
            </el-button>
            <el-button
              :loading="actionLoading"
              type="primary"
              @click="handleBatchAction('approved', '确认解封选中用户吗？')"
            >
              批量解封
            </el-button>
          </el-space>
        </div>

        <el-table
          :data="tableData"
          border
          stripe
          v-loading="loading"
          empty-text="暂无用户"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="ID" label="ID" width="80" />
          <el-table-column label="用户信息" min-width="220">
            <template #default="{ row }">
              <div class="cell-main">
                <span class="cell-title">{{ row.Name }}</span>
                <span class="cell-meta">账号：{{ row.Account }}</span>
                <span v-if="row.Phone" class="cell-meta"
                  >手机：{{ row.Phone }}</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column label="角色" width="110">
            <template #default="{ row }">
              <el-tag type="info">
                {{
                  row.Role === 'student'
                    ? '学生'
                    : row.Role === 'teacher'
                      ? '教师'
                      : row.Role === 'admin'
                        ? '管理员'
                        : '临时用户'
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag
                :type="
                  statusOptions.find((item) => item.value === row.__status)
                    ?.type ?? 'info'
                "
              >
                {{
                  statusOptions.find((item) => item.value === row.__status)
                    ?.label ?? row.__status
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="年级/用途" min-width="200">
            <template #default="{ row }">
              <div class="cell-main">
                <span class="cell-meta">年级：{{ row.Grade ?? '—' }}</span>
                <span class="cell-meta">用途：{{ row.Purpose ?? '—' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="220">
            <template #default="{ row }">
              <div class="cell-main">
                <span class="cell-meta"
                  >创建：{{ formatDate(row.CreatedAt) }}</span
                >
                <span class="cell-meta"
                  >更新：{{ formatDate(row.UpdatedAt) }}</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button
                  v-if="row.__status !== 'approved'"
                  type="success"
                  link
                  :loading="actionLoading"
                  @click="handleRowAction(row, 'approved')"
                >
                  通过
                </el-button>
                <el-button
                  v-if="row.__status !== 'rejected'"
                  type="warning"
                  link
                  :loading="actionLoading"
                  @click="handleRowAction(row, 'rejected')"
                >
                  驳回
                </el-button>
                <el-button
                  v-if="row.__status !== 'banned'"
                  type="danger"
                  link
                  :loading="actionLoading"
                  @click="handleRowAction(row, 'banned')"
                >
                  封禁
                </el-button>
                <el-button
                  v-if="row.__status === 'banned'"
                  type="primary"
                  link
                  :loading="actionLoading"
                  @click="handleRowAction(row, 'approved')"
                >
                  解封
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </section>
</template>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.page-header p {
  margin: 0.5rem 0 0;
  color: #6b7280;
}

.summary-item {
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-count {
  font-size: 1.4rem;
  font-weight: 600;
  color: #409eff;
}

.summary-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.role-tabs {
  margin-bottom: 1rem;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.cell-main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cell-title {
  font-weight: 600;
  color: #1f2937;
}

.cell-meta {
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
