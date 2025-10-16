import type { ApiResponse, PaginatedResponse } from './common'
import type { TimeSlot } from './reservation'

export interface Course {
  id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  room_id: number
  date: string
  time_slot: TimeSlot
  reason: string
  created_by: number
}

export interface CourseQuery {
  room_id?: number
  start_date?: string
  end_date?: string
  time_slot?: TimeSlot
  page?: number
  size?: number
}

export interface CreateCoursePayload {
  room_id: number
  date: string
  time_slot: TimeSlot
  reason: string
}

export type CourseListResponse = PaginatedResponse<Course[]>
export type CreateCourseResponse = ApiResponse<Course> & { code: 201 }
export type DeleteCourseResponse = ApiResponse<Course>
