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

export interface ActivityStats {
    total_issued_paid_sum: number;
    total_paid_sum: number;
    total_paid_percentage_change: number;
    total_expenses_sum: number;
    total_expenses_percentage_change: number;
    total_vat_payable: number;
    total_vat_payable_percentage_change: number;
    total_issued_sum: number;
    total_quote_sum: number;
    total_issued_count: number;
    total_quote_count: number;
    total_pending_actions: number;
    unpaidInvoicesCount: number;
    unpaidInvoiceSum: number;
    unreadDocumentsCount: number;
    total_progress_score: number;
    hasStatement: boolean;
    is_enable_login: 0 | 1;
}

export interface ActivityResponse {
    success: boolean;
    message: string;
    data: ActivityStats;
}

export interface QuickAnalysisData {
    expenses_alert: {
        is_higher: boolean;
        variation_percentage: number;
        current: number;
        previous: number | string;
    };
    pending_invoices: {
        count: number;
        total_amount: number | string;
    };
    performance_alert: {
        is_good: boolean;
        variation_percentage: number;
        current_revenue: number;
        previous_revenue: number;
    };
}

export interface QuickAnalysisResponse {
    success: boolean;
    data: QuickAnalysisData;
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

    async getActivityData(date_from: string, date_to: string): Promise<ActivityResponse> {
        try {
            const response = await api.get<ActivityResponse>(Api_Endpoints.dashboard, {
                params: { date_from, date_to },
            });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async getGraphData(year: number): Promise<GraphResponse> {
        try {
            const response = await api.get<GraphResponse>(Api_Endpoints.dashboardGraph, {
                params: { year },
            });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async getQuickAnalysis(): Promise<QuickAnalysisResponse> {
        try {
            const response = await api.get<QuickAnalysisResponse>(Api_Endpoints.customerQuickAnalysis);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async getExpenseCategoryChart(params?: { month?: number; year?: number}): Promise<{ success: boolean; data: ExpenseCategoryItem[] }> {
        try {
            const response = await api.get(Api_Endpoints.customerExpenseCategoryChart, { params });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
}

export interface GraphPoint {
    label: string;
    value: number;
}

export interface GraphResponse {
    year: string;
    chart: {
        ca: GraphPoint[];
        expenses: GraphPoint[];
    };
}

export interface ExpenseCategoryItem {
    category_id: number;
    label: string;
    value: string;
    file_url: string | null;
}

export default new DashboardService();
