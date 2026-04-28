import { useCallback } from 'react';
import receiptService, { ReceiptPayload } from '../services/receiptService';

export const useReceipt = () => {

  const getRevenues = useCallback(async (params?: { month?: number; year?: number }) => {
    try {
      const response = await receiptService.getRevenues(params);
      return {
        revenues: response.data ?? [],
        success: true,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch revenues.';
      return {
        revenues: [],
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const createRevenue = useCallback(async (payload: ReceiptPayload) => {
    try {
      const response = await receiptService.createRevenue(payload);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create revenue.';
      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const updateRevenue = useCallback(async (id: number, payload: ReceiptPayload) => {
    try {
      const response = await receiptService.updateRevenue(id, payload);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update revenue.';
      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const deleteRevenue = useCallback(async (id: number) => {
    try {
      const response = await receiptService.deleteRevenue(id);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete revenue.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  return {
    getRevenues,
    createRevenue,
    updateRevenue,
    deleteRevenue,
  };
};
