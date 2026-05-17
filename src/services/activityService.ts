import api from '../api';
import { Api_Endpoints } from './endpoints';
import type {
  ActivityFilter,
  MobileActivityResponse,
} from '../types/activity.types';

export interface MobileActivityParams {
  filter?: ActivityFilter;
  search?: string;
  page?: number;
  per_page?: number;
}

class ActivityService {
  async getMobileActivity(params: MobileActivityParams = {}): Promise<MobileActivityResponse> {
    const response = await api.get<MobileActivityResponse>(Api_Endpoints.mobileActivity, {
      params,
    });

    return response.data;
  }
}

export default new ActivityService();
