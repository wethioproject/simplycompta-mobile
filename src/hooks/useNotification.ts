import { useCallback } from 'react';
import notificationService from '../services/notificationService';


export const useNotification = () => {

  /**
   * Fetch notifications
   */
  const notification = useCallback(async () => {
    try {
      const response = await notificationService.notification();
      
      return { 
        notifications: response.data.notifications, 
        message: response.message,
        success: true 
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Notification fetch failed. Please try again.';
      return { 
        notifications: [], 
        success: false, 
        error: errorMessage 
      };
    }
  }, []);

  /**
   * Fetch single notification by ID
   */
  const viewSingleNotification = useCallback(async (id: number) => {
    try {
      const response = await notificationService.viewSingleNotification(id);
      
      return { 
        notification: response.data, 
        message: response.message,
        success: true 
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch notification details.';
      return { 
        notification: null, 
        success: false, 
        error: errorMessage 
      };
    }
  }, []);

  return {
    // Actions
    notification,
    viewSingleNotification,
  };
};