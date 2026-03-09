export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  subscriptionStatus?: string;
  createdAt: string;
}

export interface Car {
  id: string;
  userId: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  year: number | null;
  qrCodeId: string;
  nickname: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'PARKING_ISSUE' | 'BLOCKING' | 'ACCIDENT' | 'EMERGENCY' | 'GENERAL';

export interface Notification {
  id: string;
  carId: string;
  type: NotificationType;
  message: string;
  senderName: string | null;
  isRead: boolean;
  createdAt: string;
  car?: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
