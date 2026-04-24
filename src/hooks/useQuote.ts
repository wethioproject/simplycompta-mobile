import { useCallback } from 'react';
import quoteService from '../services/quoteService';

export const useQuote = () => {

    const getQuotes = useCallback(async (params?: { month?: number; year?: number }) => {
        try {
            const response = await quoteService.getQuotes(params);
            return {
                quotes: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch quotes.';
            return {
                quotes: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getQuoteResources = useCallback(async () => {
        try {
            const response = await quoteService.getQuoteResources();
            return {
                resources: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch quote resources.';
            return {
                resources: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getProductResources = useCallback(async () => {
        try {
            const response = await quoteService.getProductResources();
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

    const getQuote = useCallback(async (id: number) => {
        try {
            const result = await quoteService.getQuote(id);
            return {
                quote: result.data,
                totals: result.totals ?? null,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch quote.';
            return {
                quote: null,
                totals: null,
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const createQuote = useCallback(async (payload: any) => {
        try {
            console.log('Creating quote with payload:', payload);
            const response = await quoteService.createQuote(payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create quote.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const createProduct = useCallback(async (payload: any) => {
        try {
            const response = await quoteService.createProduct(payload);
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

    const updateQuote = useCallback(async (id: number, payload: any) => {
        try {
            const response = await quoteService.updateQuote(id, payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update quote.';
            return {
                success: false,
                error: errorMessage
            };      
        }            
    }, [])

    const deleteQuote = useCallback(async (id: number) => {
        try {
            await quoteService.deleteQuote(id);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete quote.';
            return { success: false, error: errorMessage };
        }
    }, [])

    const duplicateQuote = useCallback(async (id: number) => {
        try {
            const response = await quoteService.duplicateQuote(id);
            return { data: response.data, success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to duplicate quote.';
            return { success: false, error: errorMessage };
        }
    }, [])

    const updateQuoteStatus = useCallback(async (id: number, status: string) => {
        try {
            const response = await quoteService.updateQuoteStatus(id, status);
            return { data: response.data, success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update quote status.';
            return { success: false, error: errorMessage };
        }
    }, [])

    const getPdfDownloadUrl = useCallback((id: number): string => {
        return quoteService.getPdfDownloadUrl(id);
    }, []);

    const convertToInvoice = useCallback(async (id: number) => {
        try {
            const response = await quoteService.convertToInvoice(id);
            return { success: true, data: response };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to convert quote to invoice.';
            return { success: false, error: errorMessage };
        }
    }, []);

    return {
        getQuotes,
        getQuote,
        getQuoteResources,
        getProductResources,
        createQuote,
        createProduct,
        updateQuote,
        updateQuoteStatus,
        deleteQuote,
        duplicateQuote,
        getPdfDownloadUrl,
        convertToInvoice,
    }
};
