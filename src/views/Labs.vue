<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { createLab, deleteLab, getLabs, updateLab } from '../services/labs';
import type { CreateLabPayload, Lab, LabQuery } from '../types/lab';

const loading = ref(false);
const submitting = ref(false);
const labs = ref<Lab[]>([]);

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const filters = reactive({
  q: '',
  lab_number: '',
  teacher: '',
});

const dialogVisible = ref(false);
const editingLab = ref<Lab | null>(null);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const apiOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

const form = reactive({
  lab_name: '',
  lab_number: '',
  teacher: '',
  capacity: 0,
  rules: '',
  imageFile: null as File | null,
  imagePreview: '',
});

const buildQuery = (): LabQuery => {
  const query: LabQuery = {
    page: pagination.page,
    size: pagination.size,
  };
  if (filters.q.trim()) query.q = filters.q.trim();
  if (filters.lab_number.trim()) query.lab_number = filters.lab_number.trim();
  if (filters.teacher.trim()) query.teacher = filters.teacher.trim();
  return query;
};

const fetchLabs = async () => {
  loading.value = true;
  try {
    const response = await getLabs(buildQuery());
    labs.value = response.data.items ?? [];
    if (response.data.pagination) {
      pagination.page = response.data.pagination.page;
      pagination.size = response.data.pagination.size;
      pagination.total = response.data.pagination.total;
    } else {
      pagination.total = response.data.total ?? response.data.items.length ?? 0;
    }
  } catch {
    ElMessage.error('获取实验室列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchLabs();
};

const handleReset = () => {
  filters.q = '';
  filters.lab_number = '';
  filters.teacher = '';
  pagination.page = 1;
  fetchLabs();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchLabs();
};

const handlePageSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  fetchLabs();
};

const resetForm = () => {
  editingLab.value = null;
  form.lab_name = '';
  form.lab_number = '';
  form.teacher = '';
  form.capacity = 0;
  form.rules = '';
  form.imageFile = null;
  form.imagePreview = '';
};

const openCreateDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (lab: Lab) => {
  editingLab.value = lab;
  form.lab_name = lab.lab_name ?? '';
  form.lab_number = lab.lab_number ?? '';
  form.teacher = lab.teacher ?? '';
  form.capacity = lab.capacity ?? 0;
  form.rules = lab.rules ?? '';
  form.imageFile = null;
  form.imagePreview = lab.image ?? '';
  dialogVisible.value = true;
};

const validateForm = () => {
  if (!form.lab_name.trim()) {
    ElMessage.warning('请填写实验室名称');
    return false;
  }
  if (!form.lab_number.trim()) {
    ElMessage.warning('请填写实验室编号');
    return false;
  }
  if (form.capacity <= 0) {
    ElMessage.warning('请填写有效容量');
    return false;
  }
  if (!editingLab.value && !form.imageFile) {
    ElMessage.warning('请上传实验室图片');
    return false;
  }
  return true;
};

const handleImageChange = (file: UploadFile) => {
  if (!file.raw) return;
  form.imageFile = file.raw;
  form.imagePreview = URL.createObjectURL(file.raw);
};

const resolveImageUrl = (value?: string) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (!apiOrigin) return value;
  return `${apiOrigin}${value.startsWith('/') ? '' : '/'}${value}`;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  submitting.value = true;
  try {
    if (editingLab.value) {
      await updateLab(editingLab.value.id, {
        lab_name: form.lab_name.trim(),
        lab_number: form.lab_number.trim(),
        teacher: form.teacher.trim(),
        capacity: form.capacity,
        rules: form.rules.trim(),
        image: form.imageFile ?? undefined,
      });
      ElMessage.success('实验室更新成功');
    } else {
      const payload: CreateLabPayload = {
        lab_name: form.lab_name.trim(),
        lab_number: form.lab_number.trim(),
        teacher: form.teacher.trim(),
        capacity: form.capacity,
        rules: form.rules.trim(),
        image: form.imageFile as File,
      };
      await createLab(payload);
      ElMessage.success('实验室创建成功');
    }
    dialogVisible.value = false;
    fetchLabs();
  } catch {
    ElMessage.error('保存实验室失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (lab: Lab) => {
  ElMessageBox.confirm(`确认删除实验室「${lab.lab_name}」吗？`, '删除实验室', {
    type: 'warning',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        await deleteLab(lab.id);
        ElMessage.success('实验室已删除');
        fetchLabs();
      } catch {
        ElMessage.error('删除实验室失败，请稍后重试');
      }
    })
    .catch(() => {});
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '—';
};

const summary = computed(() => {
  const total = pagination.total;
  const capacity = labs.value.reduce(
    (sum, item) => sum + (item.capacity ?? 0),
    0
  );
  const teachers = new Set(
    labs.value.map((item) => item.teacher).filter((name) => name)
  ).size;
  return { total, capacity, teachers };
});

onMounted(() => {
  fetchLabs();
});
</script>

<template>
  <section class="labs-page">
    <header class="page-header">
      <div>
        <h1>教室管理</h1>
        <p>维护实验室教室信息，支持筛选、编辑与删除操作。</p>
      </div>
      <el-space alignment="center" size="large" wrap>
        <div class="summary-item">
          <span class="summary-count">{{ summary.total }}</span>
          <span class="summary-label">实验室总数</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ summary.capacity }}</span>
          <span class="summary-label">总容量</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ summary.teachers }}</span>
          <span class="summary-label">负责人数量</span>
        </div>
      </el-space>
    </header>

    <el-card class="filters-card">
      <el-form :inline="true" label-width="96px">
        <el-form-item label="关键词">
          <el-input
            v-model.trim="filters.q"
            placeholder="名称/编号/负责人/材料"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="实验室编号">
          <el-input
            v-model.trim="filters.lab_number"
            placeholder="例如 320"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input
            v-model.trim="filters.teacher"
            placeholder="例如 李老师"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-space>
            <el-button type="primary" :loading="loading" @click="handleSearch">
              查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="openCreateDialog">
              新建实验室
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="table-header">
          <span>实验室列表</span>
          <el-button type="primary" link :loading="loading" @click="fetchLabs">
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="labs"
        border
        stripe
        v-loading="loading"
        empty-text="暂无实验室信息"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="lab_name" label="名称" min-width="180" />
        <el-table-column label="图片" width="110">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="resolveImageUrl(row.image)"
              :preview-src-list="[resolveImageUrl(row.image)]"
              fit="cover"
              class="lab-image"
            />
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="lab_number" label="编号" width="120" />
        <el-table-column prop="teacher" label="负责人" min-width="140" />
        <el-table-column prop="material" label="材料分类" min-width="140" />
        <el-table-column prop="capacity" label="容量" width="100" />
        <el-table-column label="更新日期" width="140">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="rules"
          label="管理规则"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" link @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
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
      :title="editingLab ? '编辑实验室' : '新建实验室'"
      width="560px"
      @closed="resetForm"
    >
      <el-form label-width="92px">
        <el-form-item label="实验室名称">
          <el-input
            v-model.trim="form.lab_name"
            placeholder="例如 快速成型实验室"
          />
        </el-form-item>
        <el-form-item label="实验室编号">
          <el-input v-model.trim="form.lab_number" placeholder="例如 320" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model.trim="form.teacher" placeholder="例如 李老师" />
        </el-form-item>
        <el-form-item label="容量">
          <el-input-number
            v-model="form.capacity"
            :min="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="管理规则">
          <el-input
            v-model.trim="form.rules"
            type="textarea"
            :rows="3"
            placeholder="请输入实验室使用规则"
          />
        </el-form-item>
        <el-form-item label="实验室图片">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept="image/*"
            :on-change="handleImageChange"
            :show-file-list="true"
          >
            <el-button type="primary" plain>选择图片</el-button>
          </el-upload>
          <div v-if="form.imagePreview" class="image-preview">
            <span>当前图片：</span>
            <a
              :href="resolveImageUrl(form.imagePreview)"
              target="_blank"
              rel="noreferrer"
            >
              查看
            </a>
          </div>
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
.labs-page {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
}

.summary-count {
  font-size: 1.5rem;
  font-weight: 600;
  color: #409eff;
}

.summary-label {
  font-size: 0.85rem;
  color: #6b7280;
}

.lab-image {
  width: 64px;
  height: 40px;
  border-radius: 6px;
}

.text-muted {
  color: #9ca3af;
}

.filters-card {
  background: #fff;
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

.image-preview {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
