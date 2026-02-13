import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api';
import { mockDashboardDailyCalls } from '@/services/mockFallback';

// Helper: try API, fall back to mock
async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    console.warn('[Dialflo] API unavailable, using demo data');
    return fallback;
  }
}

// ----- Query Keys -----
export const analyticsKeys = {
  all: ['analytics'] as const,
  agentStats: (agentId: number, params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'agentStats', agentId, params] as const,
  agentOverview: (agentId: number, params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'agentOverview', agentId, params] as const,
  agentDaily: (agentId: number, params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'agentDaily', agentId, params] as const,
  agentHangup: (agentId: number, params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'agentHangup', agentId, params] as const,
  dashboardDaily: (params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'dashboardDaily', params] as const,
};

// ----- Dashboard-Level Queries -----

export function useDashboardDailyCalls(params?: {
  days?: number;
  from_date?: string;
  to_date?: string;
  exclude_internal_calls?: boolean;
}) {
  return useQuery({
    queryKey: analyticsKeys.dashboardDaily(params),
    queryFn: () => withFallback(
      () => analyticsApi.dashboardDailyCalls(params),
      mockDashboardDailyCalls
    ),
  });
}

// ----- Agent-Level Queries -----

export function useAgentAnalyticsStats(agentId: number, params?: {
  from_date?: string;
  to_date?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.agentStats(agentId, params),
    queryFn: () => analyticsApi.agentStats(agentId, params),
    enabled: agentId > 0,
  });
}

export function useAgentAnalyticsOverview(agentId: number, params?: {
  from_date?: string;
  to_date?: string;
  call_direction?: string;
  exclude_internal_calls?: boolean;
}) {
  return useQuery({
    queryKey: analyticsKeys.agentOverview(agentId, params),
    queryFn: () => analyticsApi.agentOverview(agentId, params),
    enabled: agentId > 0,
  });
}

export function useAgentDailyAnalytics(agentId: number, params?: {
  from_date?: string;
  to_date?: string;
  call_direction?: string;
  exclude_internal_calls?: boolean;
}) {
  return useQuery({
    queryKey: analyticsKeys.agentDaily(agentId, params),
    queryFn: () => analyticsApi.agentDaily(agentId, params),
    enabled: agentId > 0,
  });
}

export function useAgentHangupBreakdown(agentId: number, params?: {
  from_date?: string;
  to_date?: string;
  call_direction?: string;
  exclude_internal_calls?: boolean;
}) {
  return useQuery({
    queryKey: analyticsKeys.agentHangup(agentId, params),
    queryFn: () => analyticsApi.agentHangupBreakdown(agentId, params),
    enabled: agentId > 0,
  });
}
