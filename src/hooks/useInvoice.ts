import { useCallback } from 'react';
import invoiceService from '../services/invoiceService';

export const useInvoice = () => {

    const getInvoices = useCallback(async (params?: { month?: number; year?: number }) => {
        try {
            const response = await invoiceService.getInvoices(params);
            return {
                invoices: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch  invoices.';
            return {
                invoices: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getInvoiceResources = useCallback(async () => {
        try {
            const response = await invoiceService.getInvoiceResources();
            return {
                resources: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch invoice resources.';
            return {
                resources: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getProductResources = useCallback(async () => {
        try {
            const response = await invoiceService.getProductResources();
            return {
                resources: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch product resources.';
            return {
                resources: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getInvoice = useCallback(async (id: number) => {
        try {
            const result = await invoiceService.getInvoice(id);
            return {
                invoice: result.data,
                totals: result.totals ?? null,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch invoice.';
            return {
                invoice: null,
                totals: null,
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const createInvoice = useCallback(async (payload: any) => {
        try {
            const response = await invoiceService.createInvoice(payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload invoice.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const createProduct = useCallback(async (payload: any) => {
        try {
            const response = await invoiceService.createProduct(payload);
            return {
                data: response.data,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create product.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const updateInvoice = useCallback(async (id: number, payload: any) => {
        try {
            const response = await invoiceService.updateInvoice(id, payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update invoice.';
            return {
                success: false,
                error: errorMessage
            };      
        }            
    }, [])

    const exportInvoices = useCallback(async () => {
        try {
            const { csvData, fileName } = await invoiceService.exportInvoices();
            return { success: true, csvData, fileName };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to export invoices.';
            return { success: false, error: errorMessage, csvData: '', fileName: '' };
        }
    }, []);

    const deleteInvoice = useCallback(async (id: number) => {
        try {
            await invoiceService.deleteInvoice(id);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete invoice.';
            return { success: false, error: errorMessage };
        }
    }, [])

    const duplicateInvoice = useCallback(async (id: number) => {
        try {
            const response = await invoiceService.duplicateInvoice(id);
            return { data: response.data, success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to duplicate invoice.';
            return { success: false, error: errorMessage };
        }
    }, [])

    const updateInvoiceStatus = useCallback(async (id: number, status: string) => {
        try {
            const response = await invoiceService.updateInvoiceStatus(id, status);
            return { data: response.data, success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update invoice status.';
            return { success: false, error: errorMessage };
        }
    }, [])

    const getPdfDownloadUrl = useCallback((id: number): string => {
        return invoiceService.getPdfDownloadUrl(id);
    }, []);

    return {
        getInvoices,
        getInvoice,
        getInvoiceResources,
        getProductResources,
        createInvoice,
        createProduct,
        updateInvoice,
        updateInvoiceStatus,
        exportInvoices,
        deleteInvoice,
        duplicateInvoice,
        getPdfDownloadUrl,
    }
};
