import type { ApiResponse, ListResponseData } from '@/types/common';

export interface Lab {
  id: number;
  lab_name: string;
  lab_number: string;
  teacher: string;
  rules: string;
  image: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface LabQuery {
  q?: string;
  lab_number?: string;
  teacher?: string;
  page?: number;
  size?: number;
}

export interface CreateLabPayload {
  lab_name: string;
  lab_number: string;
  teacher: string;
  rules: string;
  image: File;
  capacity: number;
}

export type UpdateLabPayload = Partial<Omit<CreateLabPayload, 'image'>> & {
  image?: File | null;
};

export type LabListResponse = ApiResponse<ListResponseData<Lab[]>>;
export type LabDetailResponse = ApiResponse<Lab>;
export type CreateLabResponse = ApiResponse<Lab> & { code: 201 };
export type UpdateLabResponse = ApiResponse<Lab>;
export type DeleteLabResponse = ApiResponse<Lab | null>;
