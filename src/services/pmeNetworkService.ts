import api from '../api';
import { Api_Endpoints } from './endpoints';
import type {
  PmeNetworkAction,
  PmeNetworkListData,
  PmeNetworkSettings,
} from '../types/pmeNetwork.types';

export interface PmeNetworkParams {
  search?: string;
  sector?: string;
  city?: string;
  category?: string;
  verified?: boolean;
  recently_active?: boolean;
  type?: 'supplier' | 'client';
  per_page?: number;
}

class PmeNetworkService {
  async list(params: PmeNetworkParams = {}) {
    const response = await api.get<{ success: boolean; data: PmeNetworkListData }>(
      Api_Endpoints.pmeNetwork,
      { params },
    );
    return response.data;
  }

  async getSettings() {
    const response = await api.get<{ success: boolean; data: { settings: PmeNetworkSettings } }>(
      Api_Endpoints.pmeNetworkSettings,
    );
    return response.data;
  }

  async updateSettings(payload: Partial<PmeNetworkSettings>) {
    const response = await api.put<{ success: boolean; data: { settings: PmeNetworkSettings } }>(
      Api_Endpoints.pmeNetworkSettings,
      payload,
    );
    return response.data;
  }

  async action(companyId: number, action: PmeNetworkAction) {
    const response = await api.post<{ success: boolean }>(
      `${Api_Endpoints.pmeNetwork}/companies/${companyId}/action`,
      { action },
    );
    return response.data;
  }
}

export default new PmeNetworkService();
