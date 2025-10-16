<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { getReservations } from '../services/reservations'
import { getCourses } from '../services/courses'
import type { Reservation } from '../types/reservation'
import type { Course } from '../types/course'

const authStore = useAuthStore()
const { user: currentUser } = authStore

const loading = ref(true)
const reservationLoading = ref(false)
const courseLoading = ref(false)
const reservations = ref<Reservation[]>([])
const courses = ref<Course[]>([])

const summary = computed(() => {
  const totalReservations = reservations.value.length
  const upcomingReservations = reservations.value.filter((item) =>
    dayjs(item.date).isAfter(dayjs(), 'day') || dayjs(item.date).isSame(dayjs(), 'day')
  ).length
  const activeCourses = courses.value.filter((item) =>
    dayjs(item.date).isSame(dayjs(), 'day')
  ).length
  return {
    totalReservations,
    upcomingReservations,
    activeCourses,
  }
})

const fetchOverview = async () => {
  loading.value = true
  reservationLoading.value = true
  courseLoading.value = true
  try {
    const [reservationResponse, courseResponse] = await Promise.allSettled([
      getReservations({ start_date: dayjs().subtract(7, 'day').format('YYYY-MM-DD') }),
      getCourses({ page: 1, size: 5 }),
    ])

    if (reservationResponse.status === 'fulfilled') {
      reservations.value = reservationResponse.value.data
    } else {
      ElMessage.error('获取预约信息失败')
    }

    if (courseResponse.status === 'fulfilled') {
      courses.value = courseResponse.value.data
    } else {
      ElMessage.error('获取课程信息失败')
    }
  } finally {
    loading.value = false
    reservationLoading.value = false
    courseLoading.value = false
  }
}

const recentReservations = computed(() =>
  reservations.value
    .slice()
    .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
    .slice(0, 6)
)

const upcomingCourses = computed(() =>
  courses.value
    .slice()
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    .slice(0, 5)
)

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 6) return '凌晨好'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const handleRefresh = () => {
  fetchOverview()
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '—'
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : '—'
}

onMounted(() => {
  fetchOverview()
})
</script>

<template>
  <section class="dashboard">
    <header class="dashboard-header">
      <div>
        <h1>{{ greeting }}，{{ currentUser?.Name ?? currentUser?.Account ?? '管理员' }}</h1>
        <p class="subtitle">查看实验室运营数据概览，并快速处理待办事项。</p>
      </div>
      <el-button type="primary" plain :loading="loading" @click="handleRefresh">
        刷新数据
      </el-button>
    </header>

    <el-row :gutter="16">
      <el-col :md="8" :sm="12" :xs="24">
        <el-card class="stat-card">
          <div class="stat-title">总预约量（近 7 天）</div>
          <div class="stat-value">{{ summary.totalReservations }}</div>
          <div class="stat-meta">含今日及未来预约 {{ summary.upcomingReservations }} 条</div>
        </el-card>
      </el-col>
      <el-col :md="8" :sm="12" :xs="24">
        <el-card class="stat-card">
          <div class="stat-title">今日课程安排</div>
          <div class="stat-value">{{ summary.activeCourses }}</div>
          <div class="stat-meta">仅统计当天课程安排数量</div>
        </el-card>
      </el-col>
      <el-col :md="8" :sm="12" :xs="24">
        <el-card class="stat-card">
          <div class="stat-title">用户待办</div>
          <div class="stat-value">—</div>
          <div class="stat-meta">即将接入用户待审批、封禁等统计</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :lg="12" :md="24">
        <el-card header="最新预约" class="section-card" v-loading="reservationLoading">
          <el-empty v-if="!recentReservations.length" description="暂无预约数据" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="item in recentReservations"
              :key="item.id"
              :timestamp="formatDateTime(item.created_at)"
            >
              <div class="timeline-item">
                <div class="timeline-title">{{ item.purpose }}</div>
                <div class="timeline-meta">
                  <span>日期：{{ formatDate(item.date) }}</span>
                  <span>教室：{{ item.room_id }}</span>
                  <span>状态：{{ item.status }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :lg="12" :md="24">
        <el-card header="即将到来的课程" class="section-card" v-loading="courseLoading">
          <el-empty v-if="!upcomingCourses.length" description="暂无课程数据" />
          <el-table v-else :data="upcomingCourses" border size="small">
            <el-table-column prop="reason" label="课程" min-width="160" />
            <el-table-column label="日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column label="时间段" width="160">
              <template #default="{ row }">
                {{ row.time_slot }}
              </template>
            </el-table-column>
            <el-table-column prop="room_id" label="教室" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #6b7280;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 140px;
}

.stat-title {
  font-size: 0.95rem;
  color: #6b7280;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-meta {
  font-size: 0.85rem;
  color: #9ca3af;
}

.section-card {
  min-height: 320px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-title {
  font-weight: 600;
  color: #1f2937;
}

.timeline-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
