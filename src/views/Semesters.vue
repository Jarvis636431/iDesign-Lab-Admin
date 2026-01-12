<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getSemesters,
  getCurrentSemester,
  createSemester,
  updateSemester,
} from '../services/semesters';
import type {
  CreateSemesterPayload,
  Semester,
  SemesterQuery,
} from '../types/semester';

const loading = ref(false);
const currentLoading = ref(false);
const submitting = ref(false);

const semesters = ref<Semester[]>([]);
const currentSemester = ref<Semester | null>(null);

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const filters = reactive({
  is_active: '' as '' | 'true' | 'false',
});

const dialogVisible = ref(false);
const editingSemester = ref<Semester | null>(null);

const form = reactive({
  name: '',
  dateRange: [] as [string, string] | [],
  is_active: false,
});

const buildQuery = (): SemesterQuery => {
  const query: SemesterQuery = {
    page: pagination.page,
    size: pagination.size,
  };
  if (filters.is_active) {
    query.is_active = filters.is_active === 'true';
  }
  return query;
};

const formatDate = (value?: string | null, format = 'YYYY-MM-DD') => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(format) : '—';
};

const fetchSemesters = async () => {
  loading.value = true;
  try {
    const response = await getSemesters(buildQuery());
    semesters.value = response.data;
    if (response.pagination) {
      pagination.total = response.pagination.total;
      pagination.page = response.pagination.page;
      pagination.size = response.pagination.size;
    }
  } catch {
    ElMessage.error('获取学期列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const fetchCurrentSemester = async () => {
  currentLoading.value = true;
  try {
    const response = await getCurrentSemester();
    currentSemester.value = response.data;
  } catch {
    currentSemester.value = null;
  } finally {
    currentLoading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchSemesters();
};

const handleReset = () => {
  filters.is_active = '';
  pagination.page = 1;
  fetchSemesters();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchSemesters();
};

const handlePageSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  fetchSemesters();
};

const resetForm = () => {
  editingSemester.value = null;
  form.name = '';
  form.dateRange = [];
  form.is_active = false;
};

const openCreateDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (semester: Semester) => {
  editingSemester.value = semester;
  form.name = semester.name;
  form.dateRange = [
    semester.start_date.slice(0, 10),
    semester.end_date.slice(0, 10),
  ];
  form.is_active = semester.is_active;
  dialogVisible.value = true;
};

const validateForm = () => {
  if (!form.name.trim()) {
    ElMessage.warning('请填写学期名称');
    return false;
  }
  if (form.dateRange.length !== 2) {
    ElMessage.warning('请选择学期开始和结束日期');
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  submitting.value = true;
  const payload: CreateSemesterPayload = {
    name: form.name.trim(),
    start_date: form.dateRange[0]!,
    end_date: form.dateRange[1]!,
    is_active: form.is_active,
  };
  try {
    if (editingSemester.value) {
      await updateSemester(editingSemester.value.ID, payload);
      ElMessage.success('学期更新成功');
    } else {
      await createSemester(payload);
      ElMessage.success('学期创建成功');
    }
    dialogVisible.value = false;
    fetchSemesters();
    fetchCurrentSemester();
  } catch {
    ElMessage.error('保存学期失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const handleSetActive = async (semester: Semester) => {
  try {
    await ElMessageBox.confirm(
      `确认将「${semester.name}」设为当前学期吗？原激活学期将被替换。`,
      '切换当前学期',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
      }
    );
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await updateSemester(semester.ID, { is_active: true });
    ElMessage.success('当前学期已更新');
    fetchSemesters();
    fetchCurrentSemester();
  } catch {
    ElMessage.error('更新当前学期失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const tableData = computed(() => semesters.value);

onMounted(() => {
  fetchSemesters();
  fetchCurrentSemester();
});
</script>

<template>
  <section class="semesters-page">
    <header class="page-header">
      <div>
        <h1>学期管理</h1>
        <p>在这里维护学期列表、查看当前激活学期并进行切换。</p>
      </div>
      <el-button type="primary" @click="openCreateDialog"> 新建学期 </el-button>
    </header>

    <el-row :gutter="16">
      <el-col :lg="8" :md="12" :sm="24">
        <el-card class="current-card" v-loading="currentLoading">
          <template #header>
            <div class="card-header">
              <span>当前学期</span>
              <el-tag v-if="currentSemester" type="success">激活中</el-tag>
            </div>
          </template>
          <template v-if="currentSemester">
            <h3>{{ currentSemester.name }}</h3>
            <p>
              {{ formatDate(currentSemester.start_date) }} 至
              {{ formatDate(currentSemester.end_date) }}
            </p>
          </template>
          <el-empty v-else description="暂无激活学期" />
        </el-card>
      </el-col>
      <el-col :lg="16" :md="12" :sm="24">
        <el-card>
          <el-form :inline="true" label-width="96px">
            <el-form-item label="状态">
              <el-select
                v-model="filters.is_active"
                placeholder="全部状态"
                clearable
                style="width: 180px"
              >
                <el-option label="仅激活" value="true" />
                <el-option label="未激活" value="false" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-space>
                <el-button
                  type="primary"
                  :loading="loading"
                  @click="handleSearch"
                >
                  查询
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-space>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="table-header">
          <span>学期列表</span>
          <el-button
            type="primary"
            link
            :loading="loading"
            @click="fetchSemesters"
          >
            刷新
          </el-button>
        </div>
      </template>
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        empty-text="暂无学期数据"
      >
        <el-table-column prop="ID" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column label="时间范围" min-width="220">
          <template #default="{ row }">
            {{ formatDate(row.start_date) }} ~ {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '当前学期' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" link @click="openEditDialog(row)"
                >编辑</el-button
              >
              <el-button
                v-if="!row.is_active"
                type="success"
                link
                :loading="submitting"
                @click="handleSetActive(row)"
              >
                设为当前
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingSemester ? '编辑学期' : '新建学期'"
      width="520px"
      @closed="resetForm"
    >
      <el-form label-width="92px">
        <el-form-item label="学期名称">
          <el-input v-model.trim="form.name" placeholder="例如 2025 春季学期" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.is_active">设为当前学期</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.semesters-page {
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

.current-card h3 {
  margin: 0;
}

.current-card p {
  margin: 0.5rem 0 0;
  color: #6b7280;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
