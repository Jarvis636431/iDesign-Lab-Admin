<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getCourses,
  createCourse,
  deleteCourseById,
  deleteCourseByCriteria,
} from '../services/courses';
import { TIME_SLOT_OPTIONS, getTimeSlotLabel } from '../constants/reservations';
import type { Course, CourseQuery, CreateCoursePayload } from '../types/course';
import type { TimeSlot } from '../types/reservation';

type DateRange = [Date, Date];

const loading = ref(false);
const submitting = ref(false);
const courses = ref<Course[]>([]);
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const filters = reactive({
  room_id: '',
  time_slot: '' as TimeSlot | '',
  dateRange: [] as DateRange | [],
});

const createDialogVisible = ref(false);
const createForm = reactive({
  room_id: '',
  date: '',
  time_slot: '' as TimeSlot | '',
  reason: '',
});

const timeSlotOptions = TIME_SLOT_OPTIONS;

const timeSlotLabel = getTimeSlotLabel;

const buildQuery = (): CourseQuery => {
  const query: CourseQuery = {
    page: pagination.page,
    size: pagination.size,
  };

  if (filters.room_id) {
    query.room_id = Number(filters.room_id);
  }

  if (filters.time_slot) {
    query.time_slot = filters.time_slot as TimeSlot;
  }

  if (filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange;
    query.start_date = dayjs(start).format('YYYY-MM-DD');
    query.end_date = dayjs(end).format('YYYY-MM-DD');
  }

  return query;
};

const fetchCourses = async () => {
  loading.value = true;
  try {
    const response = await getCourses(buildQuery());
    courses.value = response.data;
    if (response.pagination) {
      pagination.total = response.pagination.total;
      pagination.page = response.pagination.page;
      pagination.size = response.pagination.size;
    }
  } catch {
    ElMessage.error('获取课程列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchCourses();
};

const handleReset = () => {
  filters.room_id = '';
  filters.time_slot = '';
  filters.dateRange = [];
  pagination.page = 1;
  fetchCourses();
};

const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchCourses();
};

const handlePageSizeChange = (size: number) => {
  pagination.size = size;
  pagination.page = 1;
  fetchCourses();
};

const validateCreateForm = () => {
  if (!createForm.room_id.trim()) {
    ElMessage.warning('请填写教室编号');
    return false;
  }
  if (!createForm.date) {
    ElMessage.warning('请选择日期');
    return false;
  }
  if (!createForm.time_slot) {
    ElMessage.warning('请选择时间段');
    return false;
  }
  if (!createForm.reason.trim()) {
    ElMessage.warning('请填写课程说明');
    return false;
  }
  return true;
};

const handleCreateCourse = async () => {
  if (!validateCreateForm()) return;

  submitting.value = true;
  try {
    const payload: CreateCoursePayload = {
      room_id: Number(createForm.room_id),
      date: dayjs(createForm.date).format('YYYY-MM-DD'),
      time_slot: createForm.time_slot as TimeSlot,
      reason: createForm.reason.trim(),
    };
    await createCourse(payload);
    ElMessage.success('课程创建成功');
    createDialogVisible.value = false;
    handleResetCreateForm();
    fetchCourses();
  } catch {
    ElMessage.error('课程创建失败，请检查数据或稍后再试');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteCourse = (course: Course) => {
  ElMessageBox.confirm(
    `确认删除 ${course.date.slice(0, 10)} ${timeSlotLabel(
      course.time_slot
    )} 在教室 ${course.room_id} 的课程吗？`,
    '删除课程',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteCourseById(course.ID);
        ElMessage.success('课程删除成功');
        fetchCourses();
      } catch {
        ElMessage.error('课程删除失败，请稍后重试');
      }
    })
    .catch(() => {});
};

const handleDeleteByCriteria = () => {
  ElMessageBox.prompt(
    '请输入需要删除课程的「教室编号、日期、时间段」（格式：10005,2025-10-20,afternoon）',
    '按条件删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      inputPlaceholder: '教室编号,日期,时间段',
    }
  )
    .then(async ({ value }) => {
      const parts = value.split(',').map((item) => item.trim());
      if (parts.length !== 3) {
        ElMessage.warning('输入格式不正确，请重新输入');
        return;
      }
      const [room, date, slot] = parts as [string, string, string];
      try {
        await deleteCourseByCriteria({
          room_id: Number(room),
          date,
          time_slot: slot as TimeSlot,
        });
        ElMessage.success('课程删除成功');
        fetchCourses();
      } catch {
        ElMessage.error('按照条件删除课程失败，请稍后重试');
      }
    })
    .catch(() => {});
};

const handleResetCreateForm = () => {
  createForm.room_id = '';
  createForm.date = '';
  createForm.time_slot = '';
  createForm.reason = '';
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '—';
};

const courseStats = computed(() => {
  const total = pagination.total;
  const today = courses.value.filter((item) =>
    dayjs(item.date).isSame(dayjs(), 'day')
  ).length;
  const uniqueRooms = new Set(courses.value.map((item) => item.room_id)).size;
  return { total, today, uniqueRooms };
});

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <section class="page courses-page">
    <header class="page-header">
      <div>
        <h1>课程管理</h1>
        <p>维护实验室课程安排，查看冲突并进行调整。</p>
      </div>
      <el-space alignment="center" size="large">
        <div class="summary-item">
          <span class="summary-count">{{ courseStats.total }}</span>
          <span class="summary-label">课程总数</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ courseStats.today }}</span>
          <span class="summary-label">今日课程</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ courseStats.uniqueRooms }}</span>
          <span class="summary-label">涉及教室</span>
        </div>
      </el-space>
    </header>

    <el-card class="filters-card">
      <el-form :inline="true" label-width="96px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            unlink-panels
            clearable
          />
        </el-form-item>
        <el-form-item label="教室编号">
          <el-input
            v-model.trim="filters.room_id"
            placeholder="例如 10005"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="时间段">
          <el-select
            v-model="filters.time_slot"
            placeholder="全部时间段"
            clearable
            style="width: 220px"
          >
            <el-option
              v-for="item in timeSlotOptions"
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
            <el-button type="success" @click="createDialogVisible = true">
              新建课程
            </el-button>
            <el-button type="danger" @click="handleDeleteByCriteria">
              按条件删除
            </el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="table-header">
          <span>课程列表</span>
          <el-button
            type="primary"
            link
            :loading="loading"
            @click="fetchCourses"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="courses"
        border
        stripe
        v-loading="loading"
        empty-text="暂无课程安排"
      >
        <el-table-column prop="ID" label="ID" width="90" sortable />
        <el-table-column label="日期" width="160">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="时间段" min-width="240">
          <template #default="{ row }">
            {{ timeSlotLabel(row.time_slot) }}
          </template>
        </el-table-column>
        <el-table-column prop="room_id" label="教室" width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" link disabled>编辑</el-button>
              <el-button type="danger" link @click="handleDeleteCourse(row)">
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
      v-model="createDialogVisible"
      title="新建课程"
      width="520px"
      :before-close="handleResetCreateForm"
    >
      <el-form label-width="92px" :model="createForm">
        <el-form-item label="教室编号">
          <el-input
            v-model.trim="createForm.room_id"
            placeholder="例如 10005"
            clearable
          />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="createForm.date"
            type="date"
            placeholder="请选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="时间段">
          <el-select
            v-model="createForm.time_slot"
            placeholder="请选择时间段"
            style="width: 100%"
          >
            <el-option
              v-for="item in timeSlotOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程说明">
          <el-input
            v-model.trim="createForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入课程原因或说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleCreateCourse"
          >
            确认创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.page {
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

.filters-card {
  background: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
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
