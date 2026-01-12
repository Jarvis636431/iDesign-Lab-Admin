import http from './http';
import type {
  CancelReservationResponse,
  CreateReservationPayload,
  CreateReservationResponse,
  ReservationDetailResponse,
  ReservationListResponse,
  ReservationQuery,
  UploadReservationPhotosResponse,
} from '../types/reservation';

export const getReservations = async (params?: ReservationQuery) => {
  const { data } = await http.get<ReservationListResponse>('/reservations', {
    params,
  });
  return data;
};

export const getReservationDetail = async (id: number) => {
  const { data } = await http.get<ReservationDetailResponse>(
    `/reservations/${id}`
  );
  return data;
};

export const createReservation = async (payload: CreateReservationPayload) => {
  const { data } = await http.post<CreateReservationResponse>(
    '/reservations',
    payload
  );
  return data;
};

export const cancelReservation = async (id: number) => {
  const { data } = await http.delete<CancelReservationResponse>(
    `/reservations/${id}`
  );
  return data;
};

export const uploadReservationPhotos = async (id: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const { data } = await http.post<UploadReservationPhotosResponse>(
    `/reservations/${id}/photos`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data;
};
