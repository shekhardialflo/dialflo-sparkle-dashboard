import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, audiencesApi } from '@/services/api';
import type { CampaignCreateRequest, AudienceUpdateRequest } from '@/types/api';

// ----- Query Keys -----
export const campaignKeys = {
  all: ['campaigns'] as const,
  list: () => [...campaignKeys.all, 'list'] as const,
  detail: (id: string) => [...campaignKeys.all, 'detail', id] as const,
  dispositions: (id: string) => [...campaignKeys.all, 'dispositions', id] as const,
};

export const audienceKeys = {
  all: ['audiences'] as const,
  list: () => [...audienceKeys.all, 'list'] as const,
  detail: (id: string) => [...audienceKeys.all, 'detail', id] as const,
};

// ----- Campaign Queries -----

export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.list(),
    queryFn: () => campaignsApi.list(),
  });
}

export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.detail(campaignId),
    queryFn: () => campaignsApi.get(campaignId),
    enabled: !!campaignId,
  });
}

export function useCampaignDispositions(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.dispositions(campaignId),
    queryFn: () => campaignsApi.dispositions(campaignId),
    enabled: !!campaignId,
  });
}

// ----- Campaign Mutations -----

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignCreateRequest) => campaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

export function useTriggerCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.trigger(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

export function usePauseCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.pause(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

export function useResumeCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.resume(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

export function useCancelCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.cancel(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => campaignsApi.delete(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// ----- Audience Queries -----

export function useAudiences() {
  return useQuery({
    queryKey: audienceKeys.list(),
    queryFn: () => audiencesApi.list(),
  });
}

export function useAudience(audienceId: string) {
  return useQuery({
    queryKey: audienceKeys.detail(audienceId),
    queryFn: () => audiencesApi.get(audienceId),
    enabled: !!audienceId,
  });
}

// ----- Audience Mutations -----

export function useCreateAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description, file }: { name: string; description?: string; file?: File }) =>
      audiencesApi.create(name, description, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audienceKeys.all });
    },
  });
}

export function useUpdateAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ audienceId, data }: { audienceId: string; data: AudienceUpdateRequest }) =>
      audiencesApi.update(audienceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audienceKeys.all });
    },
  });
}

export function useDeleteAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audienceId: string) => audiencesApi.delete(audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audienceKeys.all });
    },
  });
}
