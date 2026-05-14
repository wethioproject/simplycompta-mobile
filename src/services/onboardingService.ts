import api from '../api';
import { Api_Endpoints } from './endpoints';
import { ChecklistItemAPI } from '../types/onboarding.types';


export const fetchOnboardingChecklist = async (): Promise<ChecklistItemAPI[]> => {
  const response = await api.get<{ data: ChecklistItemAPI[] }>(Api_Endpoints.onboardingChecklist);
  return response.data.data;
};
