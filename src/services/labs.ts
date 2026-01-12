import http from './http';
import type {
  CreateLabPayload,
  DeleteLabResponse,
  LabDetailResponse,
  LabListResponse,
  LabQuery,
  CreateLabResponse,
  UpdateLabPayload,
  UpdateLabResponse,
} from '../types/lab';

export const getLabs = async (params?: LabQuery) => {
  const { data } = await http.get<LabListResponse>('/labs', { params });
  return data;
};

export const getLabDetail = async (id: number) => {
  const { data } = await http.get<LabDetailResponse>(`/labs/${id}`);
  return data;
};

export const createLab = async (payload: CreateLabPayload) => {
  const { data } = await http.post<CreateLabResponse>('/labs', payload);
  return data;
};

export const updateLab = async (id: number, payload: UpdateLabPayload) => {
  const { data } = await http.put<UpdateLabResponse>(`/labs/${id}`, payload);
  return data;
};

export const deleteLab = async (id: number) => {
  const { data } = await http.delete<DeleteLabResponse>(`/labs/${id}`);
  return data;
};
