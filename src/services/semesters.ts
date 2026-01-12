import http from '@/services/http';
import type {
  CreateSemesterPayload,
  CreateSemesterResponse,
  GetCurrentSemesterResponse,
  GetSemestersResponse,
  SemesterQuery,
  UpdateSemesterResponse,
} from '@/types/semester';

export const getCurrentSemester = async () => {
  const { data } =
    await http.get<GetCurrentSemesterResponse>('/semesters/current');
  return data;
};

export const getSemesters = async (params?: SemesterQuery) => {
  const { data } = await http.get<GetSemestersResponse>('/semesters', {
    params,
  });
  return data;
};

export const createSemester = async (payload: CreateSemesterPayload) => {
  const { data } = await http.post<CreateSemesterResponse>(
    '/semesters',
    payload
  );
  return data;
};

export const updateSemester = async (
  id: number,
  payload: Partial<CreateSemesterPayload>
) => {
  const { data } = await http.put<UpdateSemesterResponse>(
    `/semesters/${id}`,
    payload
  );
  return data;
};
