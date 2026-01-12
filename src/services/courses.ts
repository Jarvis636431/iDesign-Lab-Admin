import http from './http';
import type {
  CourseListResponse,
  CourseQuery,
  CreateCoursePayload,
  CreateCourseResponse,
  DeleteCourseResponse,
} from '../types/course';

export const getCourses = async (params?: CourseQuery) => {
  const { data } = await http.get<CourseListResponse>('/courses', { params });
  return data;
};

export const createCourse = async (payload: CreateCoursePayload) => {
  const { data } = await http.post<CreateCourseResponse>('/courses', payload);
  return data;
};

export const deleteCourseById = async (id: number) => {
  const { data } = await http.delete<DeleteCourseResponse>(`/courses/${id}`);
  return data;
};
