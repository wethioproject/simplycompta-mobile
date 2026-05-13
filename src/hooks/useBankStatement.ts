import { useCallback } from 'react';
import bankService from '../services/bankService';

interface BankStatementPayload {
    customer_id: string;
    month_year: string;
    statement: any;
}

export const useBankStatement = () => {

    const getBankStatements = useCallback(async (filter?: string) => {
        try {
            const response = await bankService.getBankStatements(filter);
            return {
                bankStatements: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch bank statements.';
            return {
                bankStatements: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getBankStatement = useCallback(async (id: number) => {
        try {
            const result = await bankService.getBankStatement(id);
            return {
                bankStatement: result.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch bank statement.';
            return {
                bankStatement: null,
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const createBankStatement = useCallback(async (payload: BankStatementPayload) => {
        try {
            const response = await bankService.createBankStatement(payload);
            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload bank statement.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    return {
        getBankStatements,
        getBankStatement,
        createBankStatement,
    };
};
