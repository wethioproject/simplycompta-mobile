import { useCallback } from 'react';
import expenseService from '../services/expenseService';

export const useExpense = () => {

    const getExpenses = useCallback(async (params?: { month?: number; year?: number }) => {
        try {
            const response = await expenseService.getExpenses(params);
            return {
                expenses: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch expenses.';
            return {
                expenses: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getExpenseResources = useCallback(async () => {
        try {
            const response = await expenseService.getExpenseResources();
            return {
                resources: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch expense resources.';
            return {
                resources: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getExpense = useCallback(async (id: number) => {
        try {
            const result = await expenseService.getExpense(id);
            return {
                expense: result.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch expense.';
            return {
                expense: null,
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const createExpense = useCallback(async (payload: any) => {
        try {
            const response = await expenseService.createExpense(payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload expense.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const updateExpense = useCallback(async (id: number, payload: any) => {
        try {
            const response = await expenseService.updateExpense(id, payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update expense.';
            return {
                success: false,
                error: errorMessage
            };      
        }            
    }, [])

    const exportExpenses = useCallback(async () => {
        try {
            const { csvData, fileName } = await expenseService.exportExpenses();
            return { success: true, csvData, fileName };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to export expenses.';
            return { success: false, error: errorMessage, csvData: '', fileName: '' };
        }
    }, []);

    const duplicateExpense = useCallback(async (id: number) => {
        try {
            const response = await expenseService.duplicateExpense(id);
            return { success: true, data: response.data };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to duplicate expense.';
            return { success: false, error: errorMessage };
        }
    }, []);

    const deleteExpense = useCallback(async (id: number) => {
        try {
            await expenseService.deleteExpense(id);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete expense.';
            return { success: false, error: errorMessage };
        }
    }, [])

    return {
        getExpenses,
        getExpense,
        getExpenseResources,
        createExpense,
        updateExpense,
        exportExpenses,
        duplicateExpense,
        deleteExpense,
    }
};
