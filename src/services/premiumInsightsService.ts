import api from '../api';
import { Api_Endpoints } from './endpoints';

export interface PremiumInsightItem {
  type: string;
  title: string;
}

export interface PremiumInsightsData {
  financial_health_score: number;
  attention_today: PremiumInsightItem[];
  month_end_checklist: Array<{ key: string; done: boolean; label: string }>;
  vat_assistant: { estimated_vat: number; message: string };
  ready_for_accountant_review: boolean;
}

class PremiumInsightsService {
  async getInsights() {
    const response = await api.get<{ success: boolean; data: PremiumInsightsData }>(Api_Endpoints.premiumInsights);
    return response.data;
  }
}

export default new PremiumInsightsService();
