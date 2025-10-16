<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { getReservations, cancelReservation } from "../services/reservations";
import {
  TIME_SLOT_OPTIONS,
  getTimeSlotLabel,
  RESERVATION_STATUS_OPTIONS,
  getReservationStatusMeta,
} from "../constants/reservations";
import type {
  Reservation,
  ReservationQuery,
  ReservationStatus,
  TimeSlot,
} from "../types/reservation";

type DateRange = [Date, Date];

const loading = ref(false);
const reservations = ref<Reservation[]>([]);
const detailVisible = ref(false);
const currentReservation = ref<Reservation | null>(null);

const filters = reactive({
  dateRange: [] as DateRange | [],
  time_slot: "" as TimeSlot | "",
  status: "" as ReservationStatus | "",
  room_id: "",
  creator_account: "",
  participant_account: "",
});

const timeSlotOptions = TIME_SLOT_OPTIONS;
const statusOptions = RESERVATION_STATUS_OPTIONS;

const statusTagType = (status: ReservationStatus) =>
  getReservationStatusMeta(status)?.tagType ?? "info";

const canCancel = (reservation: Reservation) =>
  reservation.status === "pending";

const buildQuery = (): ReservationQuery => {
  const query: ReservationQuery = {};
  if (filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange;
    query.start_date = dayjs(start).format("YYYY-MM-DD");
    query.end_date = dayjs(end).format("YYYY-MM-DD");
  }
  if (filters.time_slot) {
    query.time_slot = filters.time_slot;
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.room_id) {
    query.room_id = Number(filters.room_id);
  }
  if (filters.creator_account.trim()) {
    query.creator_account = filters.creator_account.trim();
  }
  if (filters.participant_account.trim()) {
    query.participant_account = filters.participant_account.trim();
  }
  return query;
};

const fetchReservations = async () => {
  loading.value = true;
  try {
    const response = await getReservations(buildQuery());
    reservations.value = response.data;
  } catch (error) {
    ElMessage.error("获取预约列表失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchReservations();
};

const handleReset = () => {
  filters.dateRange = [];
  filters.time_slot = "";
  filters.status = "";
  filters.room_id = "";
  filters.creator_account = "";
  filters.participant_account = "";
  fetchReservations();
};

const handleViewDetail = (row: Reservation) => {
  currentReservation.value = row;
  detailVisible.value = true;
};

const handleCancelReservation = (row: Reservation) => {
  ElMessageBox.confirm(`确定要取消预约「${row.purpose}」吗？`, "确认取消", {
    type: "warning",
    confirmButtonText: "确认取消",
    cancelButtonText: "再想想",
  })
    .then(async () => {
      try {
        await cancelReservation(row.ID);
        ElMessage.success("预约已取消");
        fetchReservations();
      } catch (error) {
        ElMessage.error("取消预约失败，请稍后重试");
      }
    })
    .catch(() => {});
};

const timeSlotLabel = getTimeSlotLabel;

const reservationSummary = computed(() => {
  const total = reservations.value.length;
  const pending = reservations.value.filter(
    (item) => item.status === "pending"
  ).length;
  const inProgress = reservations.value.filter(
    (item) => item.status === "in_progress"
  ).length;
  return { total, pending, inProgress };
});

const participantNames = (participants: Reservation["participants"]) =>
  participants.map((item) => item.name).join("、") || "—";

const currentPhotos = computed(() => {
  const reservation = currentReservation.value;
  if (!reservation) return [];
  const urls = new Set<string>();
  reservation.photo_urls?.forEach((url) => urls.add(url));
  if (reservation.photos_by_category) {
    Object.values(reservation.photos_by_category).forEach((arr) => {
      arr?.forEach((url) => urls.add(url));
    });
  }
  return Array.from(urls);
});

const categorizedPhotos = computed<Record<string, string[]>>(
  () => currentReservation.value?.photos_by_category ?? {}
);

const photoCategoryGroups = computed(() =>
  Object.entries(categorizedPhotos.value)
    .filter(([, urls]) => (urls?.length ?? 0) > 0)
    .map(([category, urls]) => ({ category, urls }))
);

const hasPhotoCategories = computed(() => photoCategoryGroups.value.length > 0);

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "—";
};

onMounted(() => {
  fetchReservations();
});
</script>

<template>
  <section class="page reservations-page">
    <header class="page-header">
      <div>
        <h1>预约管理</h1>
        <p>管理实验室预约，支持筛选、查看详情与取消操作。</p>
      </div>
      <el-space alignment="center" size="large" wrap>
        <div class="summary-item">
          <span class="summary-count">{{ reservationSummary.total }}</span>
          <span class="summary-label">总计</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ reservationSummary.pending }}</span>
          <span class="summary-label">待开始</span>
        </div>
        <div class="summary-item">
          <span class="summary-count">{{ reservationSummary.inProgress }}</span>
          <span class="summary-label">进行中</span>
        </div>
      </el-space>
    </header>

    <el-card class="filters-card">
      <el-form :inline="true" label-width="96px">
        <el-form-item label="预约日期">
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
        <el-form-item label="时间段">
          <el-select
            v-model="filters.time_slot"
            placeholder="全部时间段"
            clearable
          >
            <el-option
              v-for="item in timeSlotOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教室编号">
          <el-input
            v-model.trim="filters.room_id"
            placeholder="例如 10005"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="创建者账号">
          <el-input
            v-model.trim="filters.creator_account"
            placeholder="输入账号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="参与者账号">
          <el-input
            v-model.trim="filters.participant_account"
            placeholder="输入账号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-space>
            <el-button type="primary" :loading="loading" @click="handleSearch"
              >查询</el-button
            >
            <el-button @click="handleReset">重置</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="table-header">
          <span>预约列表</span>
          <el-button
            type="primary"
            link
            :loading="loading"
            @click="fetchReservations"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="reservations"
        border
        stripe
        v-loading="loading"
        empty-text="暂无预约记录"
      >
        <el-table-column prop="ID" label="ID" width="80" sortable />
        <el-table-column label="参与者" min-width="200">
          <template #default="{ row }">
            {{ participantNames(row.participants) }}
          </template>
        </el-table-column>
        <el-table-column label="日期" width="140">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="时间段" width="180">
          <template #default="{ row }">
            {{ timeSlotLabel(row.time_slot) }}
          </template>
        </el-table-column>
        <el-table-column prop="room_id" label="教室" width="120" />
        <el-table-column
          prop="purpose"
          label="用途"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" link @click="handleViewDetail(row)"
                >查看详情</el-button
              >
              <el-button
                v-if="canCancel(row)"
                type="danger"
                link
                @click="handleCancelReservation(row)"
              >
                取消
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="detailVisible"
      title="预约详情"
      size="420px"
      :destroy-on-close="true"
      :with-header="true"
    >
      <div v-if="currentReservation" class="detail-content">
        <section>
          <h3>基本信息</h3>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="用途">
              {{ currentReservation?.purpose ?? "—" }}
            </el-descriptions-item>
            <el-descriptions-item label="日期">
              {{ formatDate(currentReservation?.date) }}
            </el-descriptions-item>
            <el-descriptions-item label="时间段">
              {{ timeSlotLabel(currentReservation?.time_slot) }}
            </el-descriptions-item>
            <el-descriptions-item label="教室">
              {{ currentReservation?.room_id ?? "—" }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="statusTagType(currentReservation?.status ?? 'pending')"
                effect="dark"
              >
                {{
                  statusOptions.find(
                    (item) => item.value === currentReservation?.status
                  )?.label ?? currentReservation?.status
                }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section>
          <h3>创建者</h3>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="姓名">
              {{ currentReservation?.creator_name ?? "—" }}
            </el-descriptions-item>
            <el-descriptions-item label="账号">
              {{ currentReservation?.creator_account ?? "—" }}
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section>
          <h3>参与者</h3>
          <el-empty
            v-if="!currentReservation?.participants?.length"
            description="暂无参与者"
            :image-size="80"
          />
          <el-table
            v-else
            :data="currentReservation?.participants ?? []"
            border
            size="small"
            header-row-class-name="detail-table-header"
          >
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="account" label="账号" />
            <el-table-column prop="role" label="角色" />
          </el-table>
        </section>

        <section v-if="currentPhotos.length && !hasPhotoCategories">
          <h3>现场照片</h3>
          <el-space wrap size="small">
            <el-image
              v-for="url in currentPhotos"
              :key="url"
              :src="url"
              :preview-src-list="currentPhotos"
              fit="cover"
              class="photo-thumb"
            />
          </el-space>
        </section>

        <section v-for="group in photoCategoryGroups" :key="group.category">
          <h3>照片 - {{ group.category }}</h3>
          <el-space wrap size="small">
            <el-image
              v-for="url in group.urls"
              :key="url"
              :src="url"
              :preview-src-list="group.urls"
              fit="cover"
              class="photo-thumb"
            />
          </el-space>
        </section>
      </div>
    </el-drawer>
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
  min-width: 80px;
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

.cell-meta-text {
  font-size: 0.85rem;
  color: #6b7280;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-content section h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.detail-table-header {
  background-color: #f5f7fa !important;
}

.photo-thumb {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f2f4f7;
}
</style>
