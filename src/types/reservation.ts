import type { ApiResponse, ListResponseData } from './common';

export type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening';
export type ReservationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'violated'
  | 'repaired';

export interface ReservationParticipant {
  user_id: number;
  account?: string;
  name: string;
  role: string;
}

export interface ExportReservationItem {
  id: number;
  creator_id: number;
  creator_account?: string;
  creator_name?: string;
  purpose: string;
  date: string;
  time_slot: TimeSlot;
  time_range: string;
  lab_id: number;
  lab_number: string;
  lab_name: string;
  participants: ReservationParticipant[];
  photo_urls?: string[];
  photos_by_category?: Record<string, string[]>;
}

export interface Reservation {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  creator_id: number;
  creator_account?: string;
  creator_name?: string;
  purpose: string;
  date: string;
  time_slot: TimeSlot;
  lab_id: number;
  status: ReservationStatus;
  photo_urls?: string[];
  photos_by_category?: Record<string, string[]>;
  participants: ReservationParticipant[];
  canceled_at?: string;
}

export interface ReservationQuery {
  start_date?: string;
  end_date?: string;
  time_slot?: TimeSlot;
  lab_id?: number;
  creator_account?: string;
  participant_account?: string;
  user_id?: number;
  status?: ReservationStatus;
  page?: number;
  size?: number;
}

export interface CreateReservationPayload {
  purpose: string;
  date: string;
  time_slot: TimeSlot;
  lab_id: number;
  participant_accounts: string[];
}

export type ReservationListResponse = ApiResponse<ListResponseData<Reservation[]>>;
export type ReservationDetailResponse = ApiResponse<Reservation>;

export interface CreateReservationResponse extends ApiResponse<Reservation> {
  code: 201;
}

export interface CancelReservationResponse extends ApiResponse<Reservation> {}

export interface UploadReservationPhotosResponse
  extends ApiResponse<{
    reservation_id: number;
    category: string;
    new_upload_count: number;
    category_photo_count: number;
    total_photo_count: number;
    remaining_slots: Record<string, number>;
    photos_by_category: Record<string, string[]>;
  }> {}

export type ExportReservationsResponse = ApiResponse<
  ListResponseData<ExportReservationItem[]>
>;
