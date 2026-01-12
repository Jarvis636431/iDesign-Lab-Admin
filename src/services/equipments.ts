import http from './http';
import type {
  CreateEquipmentPayload,
  CreateEquipmentResponse,
  DeleteEquipmentResponse,
  EquipmentDetailResponse,
  EquipmentListResponse,
  EquipmentQuery,
  UpdateEquipmentPayload,
  UpdateEquipmentResponse,
} from '../types/equipment';

export const getEquipments = async (params?: EquipmentQuery) => {
  const { data } = await http.get<EquipmentListResponse>('/equipments', {
    params,
  });
  return data;
};

export const getEquipmentDetail = async (id: number) => {
  const { data } = await http.get<EquipmentDetailResponse>(`/equipments/${id}`);
  return data;
};

export const createEquipment = async (payload: CreateEquipmentPayload) => {
  const { data } = await http.post<CreateEquipmentResponse>(
    '/equipments',
    payload
  );
  return data;
};

export const updateEquipment = async (
  id: number,
  payload: UpdateEquipmentPayload
) => {
  const { data } = await http.patch<UpdateEquipmentResponse>(
    `/equipments/${id}`,
    payload
  );
  return data;
};

export const deleteEquipment = async (id: number) => {
  const { data } = await http.delete<DeleteEquipmentResponse>(
    `/equipments/${id}`
  );
  return data;
};
