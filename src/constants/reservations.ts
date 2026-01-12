import type { ReservationStatus, TimeSlot } from '@/types/reservation';

export const TIME_SLOT_OPTIONS: Array<{ label: string; value: TimeSlot }> = [
  { label: '09:00-10:30', value: 'morning' },
  { label: '10:30-12:00', value: 'noon' },
  { label: '13:00-14:30', value: 'afternoon' },
  { label: '14:30-16:00', value: 'evening' },
];

export const getTimeSlotLabel = (value?: TimeSlot | '') => {
  if (!value) return '—';
  return TIME_SLOT_OPTIONS.find((item) => item.value === value)?.label ?? value;
};

export const RESERVATION_STATUS_META: Record<
  ReservationStatus,
  { label: string; tagType: '' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  pending: { label: '待开始', tagType: 'warning' },
  in_progress: { label: '进行中', tagType: 'success' },
  completed: { label: '已完成', tagType: 'info' },
  cancelled: { label: '已取消', tagType: '' },
  violated: { label: '已违规', tagType: 'danger' },
  repaired: { label: '已补救', tagType: 'info' },
};

export const getReservationStatusMeta = (status: ReservationStatus) =>
  RESERVATION_STATUS_META[status];

export const RESERVATION_STATUS_OPTIONS = (
  Object.keys(RESERVATION_STATUS_META) as ReservationStatus[]
).map((value) => ({
  value,
  label: RESERVATION_STATUS_META[value].label,
}));
