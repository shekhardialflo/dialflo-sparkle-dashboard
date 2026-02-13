import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callsApi, callInsightsApi } from '@/services/api';

// ----- Query Keys -----
export const callKeys = {
  all: ['calls'] as const,
  list: () => [...callKeys.all, 'list'] as const,
  detail: (taskUuid: string) => [...callKeys.all, 'detail', taskUuid] as const,
};

export const insightKeys = {
  all: ['callInsights'] as const,
  list: (params?: Record<string, unknown>) => [...insightKeys.all, 'list', params] as const,
  detail: (id: number) => [...insightKeys.all, 'detail', id] as const,
  byCall: (callId: string) => [...insightKeys.all, 'byCall', callId] as const,
};

// ----- Call Queries -----

export function useCallDetails() {
  return useQuery({
    queryKey: callKeys.list(),
    queryFn: () => callsApi.list(),
  });
}

export function useCallDetail(taskUuid: string, refetch = false) {
  return useQuery({
    queryKey: callKeys.detail(taskUuid),
    queryFn: () => callsApi.getByTaskUuid(taskUuid, { refetch }),
    enabled: !!taskUuid,
  });
}

// ----- Call Insights Queries -----

export function useCallInsights(params?: {
  limit?: number;
  offset?: number;
  agent_ids?: string;
  is_verified?: boolean;
  verified_by?: number;
  created_after_date?: string;
  created_after_time?: string;
  created_before_date?: string;
  created_before_time?: string;
  min_duration?: number;
  max_duration?: number;
}) {
  return useQuery({
    queryKey: insightKeys.list(params),
    queryFn: () => callInsightsApi.list(params),
  });
}

export function useCallInsight(insightId: number) {
  return useQuery({
    queryKey: insightKeys.detail(insightId),
    queryFn: () => callInsightsApi.get(insightId),
    enabled: insightId > 0,
  });
}

export function useCallInsightsByCallId(callId: string) {
  return useQuery({
    queryKey: insightKeys.byCall(callId),
    queryFn: () => callInsightsApi.getByCallId(callId),
    enabled: !!callId,
  });
}

// ----- Call Insight Mutations -----

export function useUpdateCallInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ callId, data }: { callId: string; data: Record<string, unknown> }) =>
      callInsightsApi.update(callId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightKeys.all });
    },
  });
}

export function useDeleteCallInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (insightId: number) => callInsightsApi.delete(insightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightKeys.all });
    },
  });
}

// ----- Make Call Mutation -----

export function useMakeCall() {
  return useMutation({
    mutationFn: ({ data, priority }: { data: Record<string, unknown>; priority?: string }) =>
      callsApi.makeCall(data, priority),
  });
}
