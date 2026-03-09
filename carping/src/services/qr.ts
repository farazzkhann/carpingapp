import { api } from './api';
import type { ApiResponse } from '../types';

export type NotificationType = 'PARKING_ISSUE' | 'BLOCKING' | 'ACCIDENT' | 'EMERGENCY' | 'GENERAL';

export interface PublicCarInfo {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  year: number | null;
  nickname: string | null;
  qrCodeId: string;
}

export interface SendNotificationPayload {
  type: NotificationType;
  message: string;
  senderName?: string;
}

export const qrService = {
  async getCarByQrCode(qrCodeId: string): Promise<PublicCarInfo> {
    const res = await api.get<ApiResponse<PublicCarInfo>>(`/qr/${qrCodeId}`);
    return res.data;
  },

  async sendNotification(qrCodeId: string, payload: SendNotificationPayload): Promise<void> {
    await api.post<ApiResponse<unknown>>(`/qr/${qrCodeId}/notify`, payload);
  },
};
