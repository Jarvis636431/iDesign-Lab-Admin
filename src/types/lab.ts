import type { ApiResponse, PaginationMeta } from './common';

export interface Lab {
  id: number;
  labname: string;
  labnumber: string;
  teacher: string;
  rules: string;
  image: string;
  material: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface LabQuery {
  q?: string;
  labnumber?: string;
  teacher?: string;
  material?: string;
  page?: number;
  size?: number;
}

export interface CreateLabPayload {
  labname: string;
  labnumber: string;
  teacher: string;
  rules: string;
  image: string;
  material: string;
  capacity: number;
}

export type UpdateLabPayload = Partial<CreateLabPayload>;

export type LabListResponse = ApiResponse<Lab[]> & {
  pagination?: PaginationMeta;
  total?: number;
};
export type LabDetailResponse = ApiResponse<Lab>;
export type CreateLabResponse = ApiResponse<Lab> & { code: 201 };
export type UpdateLabResponse = ApiResponse<Lab>;
export type DeleteLabResponse = ApiResponse<Lab | null>;
