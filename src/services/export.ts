import http from './http'
import type { ReservationQuery } from '../types/reservation'

export const exportReservations = async (params?: ReservationQuery) => {
  const { data } = await http.get<Blob>('/export/reservations', {
    params,
    responseType: 'blob',
  })
  return data
}
