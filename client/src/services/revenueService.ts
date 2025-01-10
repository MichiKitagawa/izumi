//src/services/revenueService.ts
import axios from 'axios';
import { RevenueData } from '../pages/RevenueReport';

export const fetchRevenueData = async (): Promise<RevenueData[]> => {
  const response = await axios.get<RevenueData[]>('/api/revenue');
  return response.data;
};
