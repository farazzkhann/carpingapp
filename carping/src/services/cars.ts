import { api } from './api';
import type { Car, ApiResponse } from '../types';

export interface CreateCarPayload {
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  year?: number;
  nickname?: string;
}

export type UpdateCarPayload = Partial<CreateCarPayload>;

export const carsService = {
  async getCars(): Promise<Car[]> {
    const res = await api.get<ApiResponse<Car[]>>('/cars');
    return res.data;
  },

  async getCarById(id: string): Promise<Car> {
    const res = await api.get<ApiResponse<Car>>(`/cars/${id}`);
    return res.data;
  },

  async createCar(payload: CreateCarPayload): Promise<Car> {
    const res = await api.post<ApiResponse<Car>>('/cars', payload);
    return res.data;
  },

  async updateCar(id: string, payload: UpdateCarPayload): Promise<Car> {
    const res = await api.patch<ApiResponse<Car>>(`/cars/${id}`, payload);
    return res.data;
  },

  async deleteCar(id: string): Promise<void> {
    await api.delete(`/cars/${id}`);
  },
};
