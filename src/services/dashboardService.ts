import api from '../api';
import { Api_Endpoints } from './endpoints';

export interface ProgressData {
    totalInvoice: number;
    totalUnpaidInvoice: number;
    totalPaidInvoice: number;
    totalPartialInvoice: number;
    totalDueInvoice: number;
    unpaidPr: number;
    paidPr: number;
    partialPr: number;
    duePr: number;
    unpaidColor: string;
    paidColor: string;
    partialColor: string;
    dueColor: string;
}

export interface DashboardData {
    total_expenses: number;
    total_revenue: number;
    has_unread_notifications: boolean;
    progress_data?: ProgressData;
}

export interface DashboardResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}

export type DashboardFilter = 'this_week' | 'this_month' | 'this_year' | 'last_year' | 'all' | null;

class DashboardService {
    async getDashboardData(filter: DashboardFilter="this_week"): Promise<DashboardResponse> {
        try {
            const response = await api.get<DashboardResponse>(Api_Endpoints.dashboard, {
                params: {
                    filter: filter
                }
            })
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
}

export default new DashboardService();
