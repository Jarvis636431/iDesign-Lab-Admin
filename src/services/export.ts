import http from '@/services/http';
import type {
  ExportReservationsResponse,
  ReservationQuery,
} from '@/types/reservation';

export const exportReservations = async (
  params?: ReservationQuery & { format?: 'excel' | 'json' }
) => {
  if (params?.format === 'json') {
    const { data } = await http.get<ExportReservationsResponse>(
      '/export/reservations',
      { params }
    );
    return data;
  }

  const { data } = await http.get<Blob>('/export/reservations', {
    params,
    responseType: 'blob',
  });
  return data;
};
