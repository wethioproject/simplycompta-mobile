import { useCallback } from 'react';
import supplierService, { SupplierPayload } from '../services/supplierService';

export const useSupplier = () => {

  const getSuppliers = useCallback(async (params?: { like?: string }) => {
    try {
      const response = await supplierService.getSuppliers(params);
      return { suppliers: response.data ?? [], success: true };
    } catch (error: any) {
      return {
        suppliers: [],
        success: false,
        error: error.response?.data?.message || 'Failed to fetch suppliers.',
      };
    }
  }, []);

  const getSupplierById = useCallback(async (id: number) => {
    try {
      const response = await supplierService.getSupplierById(id);
      return { supplier: response.data, success: true };
    } catch (error: any) {
      return {
        supplier: null,
        success: false,
        error: error.response?.data?.message || 'Failed to fetch supplier.',
      };
    }
  }, []);

  const createSupplier = useCallback(async (payload: SupplierPayload) => {
    try {
      const response = await supplierService.createSupplier(payload);
      return { supplier: response.data, success: true };
    } catch (error: any) {
      return {
        supplier: null,
        success: false,
        error: error.response?.data?.message || 'Failed to create supplier.',
      };
    }
  }, []);

  const updateSupplier = useCallback(async (id: number, payload: SupplierPayload) => {
    try {
      const response = await supplierService.updateSupplier(id, payload);
      return { supplier: response.data, success: true };
    } catch (error: any) {
      return {
        supplier: null,
        success: false,
        error: error.response?.data?.message || 'Failed to update supplier.',
      };
    }
  }, []);

  const deleteSupplier = useCallback(async (id: number) => {
    try {
      await supplierService.deleteSupplier(id);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete supplier.',
      };
    }
  }, []);

  const getSupplierExpenses = useCallback(async (id: number) => {
    try {
      const response = await supplierService.getSupplierExpenses(id);
      return { expenses: response.data ?? [], success: true };
    } catch (error: any) {
      return {
        expenses: [],
        success: false,
        error: error.response?.data?.message || 'Failed to fetch supplier expenses.',
      };
    }
  }, []);

  return {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierExpenses,
  };
};
