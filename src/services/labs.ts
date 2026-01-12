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

const buildLabFormData = (payload: UpdateLabPayload | CreateLabPayload) => {
  const formData = new FormData();
  if (payload.lab_name !== undefined)
    formData.append('lab_name', payload.lab_name);
  if (payload.lab_number !== undefined)
    formData.append('lab_number', payload.lab_number);
  if (payload.teacher !== undefined) formData.append('teacher', payload.teacher);
  if (payload.rules !== undefined) formData.append('rules', payload.rules);
  if (payload.capacity !== undefined) {
    formData.append('capacity', String(payload.capacity));
  }
  if ('image' in payload && payload.image) {
    formData.append('image', payload.image);
  }
  return formData;
};

export const getLabs = async (params?: LabQuery) => {
  const { data } = await http.get<LabListResponse>('/labs', { params });
  return data;
};

export const getLabDetail = async (id: number) => {
  const { data } = await http.get<LabDetailResponse>(`/labs/${id}`);
  return data;
};

export const createLab = async (payload: CreateLabPayload) => {
  const { data } = await http.post<CreateLabResponse>(
    '/labs',
    buildLabFormData(payload),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const updateLab = async (id: number, payload: UpdateLabPayload) => {
  const { data } = await http.put<UpdateLabResponse>(
    `/labs/${id}`,
    buildLabFormData(payload),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const deleteLab = async (id: number) => {
  const { data } = await http.delete<DeleteLabResponse>(`/labs/${id}`);
  return data;
};
