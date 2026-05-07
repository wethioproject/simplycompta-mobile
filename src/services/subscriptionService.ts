import api from '../api';
import { Api_Endpoints } from './endpoints';
import type { SubscriptionData } from '../types/subscription.types';



class SubscriptionService {

  async getSubscriptionStatus(): Promise<SubscriptionData> {
    try {
      const response = await api.get(Api_Endpoints.getSubscriptionStatus);
      return response.data.data;
    } catch (error: any) {
      console.error('Subscription fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

}

export default new SubscriptionService();
