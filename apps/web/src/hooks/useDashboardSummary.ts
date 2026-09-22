import useSWR from 'swr';
import api from '@/lib/api';
import { DashboardSummaryResponse } from '@/types/dashboard';

const fetcher = (url: string) => api.get<DashboardSummaryResponse>(url).then((res) => res.data);

export function useDashboardSummary() {
  const { data, error, isLoading, mutate } = useSWR<DashboardSummaryResponse, Error>(
    '/dashboard/summary',
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch just by focusing window
      dedupingInterval: 60000, // Dedup requests within 1 min
    }
  );

  return {
    summary: data,
    isLoading,
    isError: error,
    mutate,
  };
}
