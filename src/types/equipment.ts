import type { ApiResponse, ListResponseData } from '@/types/common';

export type EquipmentStatus = 'available' | 'maintenance' | 'out_of_service';

export interface Equipment {
  id: number;
  lab_id: number;
  name: string;
  category: string;
  model: string;
  status: EquipmentStatus;
  created_at: string;
  updated_at: string;
}

export interface EquipmentQuery {
  lab_id?: number;
  q?: string;
  category?: string;
  status?: EquipmentStatus;
  page?: number;
  size?: number;
}

export interface CreateEquipmentPayload {
  lab_id: number;
  name: string;
  category: string;
  model: string;
  status: EquipmentStatus;
}

export type UpdateEquipmentPayload = Partial<CreateEquipmentPayload>;

export type EquipmentListResponse = ApiResponse<ListResponseData<Equipment[]>>;
export type EquipmentDetailResponse = ApiResponse<Equipment>;
export type CreateEquipmentResponse = ApiResponse<Equipment> & { code: 201 };
export type UpdateEquipmentResponse = ApiResponse<Equipment>;
export type DeleteEquipmentResponse = ApiResponse<null>;
