import type { ApiResponse, PaginatedResponse } from './common';

export interface Semester {
  ID: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface SemesterQuery {
  page?: number;
  size?: number;
  is_active?: boolean;
}

export interface CreateSemesterPayload {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export type GetSemestersResponse = PaginatedResponse<Semester[]>;
export type GetCurrentSemesterResponse = ApiResponse<Semester>;
export type CreateSemesterResponse = ApiResponse<Semester> & { code: 201 };
export type UpdateSemesterResponse = ApiResponse<Semester>;
