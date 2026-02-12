import api from '../api';


export interface Notification {
    id: number;
    customer_id: number;
    sender_id: number;
    title: string;
    message: string;
    is_read: boolean;
    data: string | null;
    document: string | null;
    created_at: string;
    updated_at: string;
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data: {
        notifications: Notification[];
    };
}

export interface SingleNotificationResponse {
    success: boolean;
    message: string;
    data: Notification;
}


class NotificationService {

    async notification(): Promise<NotificationResponse> {
        try {
            const response = await api.get<NotificationResponse>('/customer/notification');
            return response.data;
        } catch (error: any) {
            console.error('Notification error:', error.response?.data || error.message);
            throw error;
        }
    }

    async viewSingleNotification(id: number): Promise<SingleNotificationResponse> {
        try {
            const response = await api.get<SingleNotificationResponse>(`/customer/view-single-notification/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Single notification error:', error.response?.data || error.message);
            throw error;
        }
    }
}


const notificationService = new NotificationService();
export default notificationService;