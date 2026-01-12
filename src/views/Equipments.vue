<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createEquipment,
  deleteEquipment,
  getEquipments,
  updateEquipment,
} from '@/services/equipments';
import type {
  CreateEquipmentPayload,
  Equipment,
  EquipmentQuery,
  EquipmentStatus,
} from '@/types/equipment';

const loading = ref(false);
const submitting = ref(false);
const equipments = ref<Equipment[]>([]);

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const filters = reactive({
  lab_id: '',
  q: '',
  category: '',
  status: '' as EquipmentStatus | '',
});

const dialogVisible = ref(false);
const editingEquipment = ref<Equipment | null>(null);

const form = reactive({
  lab_id: '',
  name: '',
  category: '',
  model: '',
  status: 'available' as EquipmentStatus,
});

const statusOptions: Array<{ value: EquipmentStatus; label: string; type: string }> = [
  { value: 'available', label: '可用', type: 'success' },
  { value: 'maintenance', label: '维护中', type: 'warning' },
  { value: 'out_of_service', label: '停用', type: 'danger' },
];

const buildQuery = (): EquipmentQuery => {
  const query: EquipmentQuery = {
    page: pagination.page,
    size: pagination.size,
  };
  if (filters.lab_id) query.lab_id = Number(filters.lab_id);
  if (filters.q.trim()) query.q = filters.q.trim();
  if (filters.category.trim()) query.category = filters.category.trim();
  if (filters.status) query.status = filters.status;
  return query;
};

const fetchEquipments = async () => {
  loading.value = true;
  try {
    const response = await getEquipments(buildQuery());
    equipments.value = response.data.items ?? [];
    if (response.data.pagination) {
      pagination.page = response.data.pagination.page;
      pagination.size = response.data.pagination.size;
      pagination.total = response.data.pagination.total;
    } else {
      pagination.total = response.data.total ?? response.data.items.length ?? 0;
    }
  } catch {
    ElMessage.error('获取设备列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchEquipments();
};

const handleReset = () => {
  filters.lab_id = '';
  filters.q = '';
  filters.category = '';
  filters.status = '';
  pagination.page = 1;
  fetchEquipments();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchEquipments();
};

const handlePageSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  fetchEquipments();
};

const resetForm = () => {
  editingEquipment.value = null;
  form.lab_id = '';
  form.name = '';
  form.category = '';
  form.model = '';
  form.status = 'available';
};

const openCreateDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (equipment: Equipment) => {
  editingEquipment.value = equipment;
  form.lab_id = String(equipment.lab_id ?? '');
  form.name = equipment.name ?? '';
  form.category = equipment.category ?? '';
  form.model = equipment.model ?? '';
  form.status = equipment.status ?? 'available';
  dialogVisible.value = true;
};

const validateForm = () => {
  if (!form.lab_id.trim()) {
    ElMessage.warning('请填写实验室 ID');
    return false;
  }
  if (!form.name.trim()) {
    ElMessage.warning('请填写设备名称');
    return false;
  }
  if (!form.category.trim()) {
    ElMessage.warning('请填写设备分类');
    return false;
  }
  if (!form.model.trim()) {
    ElMessage.warning('请填写设备型号');
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  submitting.value = true;
  const payload: CreateEquipmentPayload = {
    lab_id: Number(form.lab_id),
    name: form.name.trim(),
    category: form.category.trim(),
    model: form.model.trim(),
    status: form.status,
  };
  try {
    if (editingEquipment.value) {
      await updateEquipment(editingEquipment.value.id, payload);
      ElMessage.success('设备更新成功');
    } else {
      await createEquipment(payload);
      ElMessage.success('设备创建成功');
    }
    dialogVisible.value = false;
    fetchEquipments();
  } catch {
    ElMessage.error('保存设备失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (equipment: Equipment) => {
  ElMessageBox.confirm(`确认删除设备「${equipment.name}」吗？`, '删除设备', {
    type: 'warning',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        await deleteEquipment(equipment.id);
        ElMessage.success('设备已删除');
        fetchEquipments();
      } catch {
        ElMessage.error('删除设备失败，请稍后重试');
      }
    })
    .catch(() => {});
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '—';
};

const statusMeta = (status: EquipmentStatus) =>
  statusOptions.find((item) => item.value === status);

const summary = computed(() => {
  const total = pagination.total;
  const available = equipments.value.filter(
    (item) => item.status === 'available'
  ).length;
  const maintenance = equipments.value.filter(
    (item) => item.status === 'maintenance'
  ).length;
  return { total, available, maintenance };
});

onMounted(() => {
  fetchEquipments();
});
</script>

<template>
  <section class="equipments-page">
    <header class="page-header">
      <div>
        <h1>设备管理</h1>
        <p>维护实验室设备信息，支持筛选、新增与更新状态。</p>
      </div>
      <el-space alignment="center" size="large" wrap>
        <div class="summary-item">
          <span class="summary-count">{{ summary.total }}</span>
          <span class="summary-label">设备总数</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ summary.available }}</span>
          <span class="summary-label">可用设备</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ summary.maintenance }}</span>
          <span class="summary-label">维护中</span>
        </div>
      </el-space>
    </header>

    <el-card class="filters-card">
      <el-form :inline="true" label-width="96px">
        <el-form-item label="实验室 ID">
          <el-input
            v-model.trim="filters.lab_id"
            placeholder="例如 10001"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model.trim="filters.q"
            placeholder="名称/型号/分类"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-input
            v-model.trim="filters.category"
            placeholder="例如 加工设备"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-space>
            <el-button type="primary" :loading="loading" @click="handleSearch">
              查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="openCreateDialog">
              新建设备
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="table-header">
          <span>设备列表</span>
          <el-button type="primary" link :loading="loading" @click="fetchEquipments">
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="equipments"
        border
        stripe
        v-loading="loading"
        empty-text="暂无设备"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="category" label="分类" width="140" />
        <el-table-column prop="model" label="型号" min-width="140" />
        <el-table-column prop="lab_id" label="实验室" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusMeta(row.status)?.type ?? 'info'">
              {{ statusMeta(row.status)?.label ?? row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="140">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
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
      :title="editingEquipment ? '编辑设备' : '新建设备'"
      width="520px"
      @closed="resetForm"
    >
      <el-form label-width="92px">
        <el-form-item label="实验室 ID">
          <el-input v-model.trim="form.lab_id" placeholder="例如 10001" />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model.trim="form.name" placeholder="例如 3D 打印机" />
        </el-form-item>
        <el-form-item label="设备分类">
          <el-input v-model.trim="form.category" placeholder="例如 加工设备" />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input v-model.trim="form.model" placeholder="例如 Model X" />
        </el-form-item>
        <el-form-item label="设备状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
.equipments-page {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
