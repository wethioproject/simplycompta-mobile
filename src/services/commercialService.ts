import api from '../api';
import { Api_Endpoints } from './endpoints';
import type { CommercialStatsData, CommercialStatsParams, Salesperson } from '../types/commercial.types';

class CommercialService {
  async getSalespeople() {
    const response = await api.get<{ success: boolean; data: Salesperson[] }>(Api_Endpoints.salespeople);
    return response.data;
  }

  async createSalesperson(payload: Pick<Salesperson, 'name'> & Partial<Pick<Salesperson, 'email' | 'phone' | 'active'>>) {
    const response = await api.post<{ success: boolean; data: Salesperson; message?: string }>(
      Api_Endpoints.salespeople,
      payload,
    );
    return response.data;
  }

  async updateSalesperson(id: number, payload: Partial<Pick<Salesperson, 'name' | 'email' | 'phone' | 'active'>>) {
    const response = await api.put<{ success: boolean; data: Salesperson; message?: string }>(
      `${Api_Endpoints.salespeople}/${id}`,
      payload,
    );
    return response.data;
  }

  async deactivateSalesperson(id: number) {
    const response = await api.delete<{ success: boolean; data: Salesperson; message?: string }>(
      `${Api_Endpoints.salespeople}/${id}`,
    );
    return response.data;
  }

  async getStats(params: CommercialStatsParams = {}) {
    const response = await api.get<{ success: boolean; data: CommercialStatsData }>(
      Api_Endpoints.commercialStats,
      { params },
    );
    return response.data;
  }
}

export default new CommercialService();
