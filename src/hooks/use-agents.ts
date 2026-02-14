import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi, taskAgentsApi } from '@/services/api';
import {
  mockAgents,
  mockVoices,
  mockNumbers,
  mockTaskAgents,
} from '@/services/mockFallback';
import type {
  CallAgentRequest,
  CallAgentRequestUpdate,
  CallAgentResponse,
  TaskAgentRequest,
  TaskAgentRequestUpdate,
  AgentTasks,
} from '@/types/api';

// ----- Query Keys -----
export const agentKeys = {
  all: ['agents'] as const,
  list: (params?: { enabled?: boolean; phone_number?: string }) =>
    [...agentKeys.all, 'list', params] as const,
  detail: (id: number) => [...agentKeys.all, 'detail', id] as const,
  voices: () => [...agentKeys.all, 'voices'] as const,
  numbers: () => [...agentKeys.all, 'numbers'] as const,
  health: (id: number) => [...agentKeys.all, 'health', id] as const,
  callStats: (id: number, params?: Record<string, unknown>) =>
    [...agentKeys.all, 'callStats', id, params] as const,
  taskAgents: (id: number) => [...agentKeys.all, 'taskAgents', id] as const,
  allTaskAgents: () => [...agentKeys.all, 'taskAgents'] as const,
};

// Helper: try API, fall back to mock
async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    console.warn('[Dialflo] API unavailable, using demo data');
    return fallback;
  }
}

// ----- Agent Queries -----

export function useAgents(params?: { enabled?: boolean; phone_number?: string }) {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: () => withFallback(() => agentsApi.list(params), mockAgents),
  });
}

export function useAgent(agentId: number) {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => withFallback(
      () => agentsApi.get(agentId),
      mockAgents.filter(a => a.id === agentId)
    ),
    enabled: agentId > 0,
  });
}

export function useVoices() {
  return useQuery({
    queryKey: agentKeys.voices(),
    queryFn: () => withFallback(() => agentsApi.voices(), mockVoices),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePhoneNumbers() {
  return useQuery({
    queryKey: agentKeys.numbers(),
    queryFn: () => withFallback(() => agentsApi.numbers(), mockNumbers),
  });
}

export function useAgentHealth(agentId: number, enabled = true) {
  return useQuery({
    queryKey: agentKeys.health(agentId),
    queryFn: () => agentsApi.health(agentId),
    enabled: enabled && agentId > 0,
  });
}

export function useAgentCallStats(agentId: number, params?: {
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  call_type?: string;
  min_duration?: number;
  max_duration?: number;
}) {
  return useQuery({
    queryKey: agentKeys.callStats(agentId, params),
    queryFn: () => agentsApi.callStats(agentId, params),
    enabled: agentId > 0,
  });
}

// ----- Agent Mutations -----

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CallAgentRequest) => {
      try {
        return await agentsApi.create(data);
      } catch {
        // Mock: create a fake agent and add to cache
        const newAgent: CallAgentResponse = {
          id: Date.now(),
          prompt: data.prompt || { system: '' },
          agent_name: data.agent_name,
          agent_phone_number: data.agent_phone_number || '',
          voice_id: data.voice_id,
          version: 1,
          welcome_text: data.welcome_text || { default: '' },
          tools: null,
          enabled: data.enabled ?? true,
          save_stats: true,
          server_type: 'PROD',
          call_type: data.call_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_persona: null,
          client_id: null,
          pair_agent_id: null,
          health_monitoring_enabled: false,
          health_alert_emails: null,
          last_health_status: null,
          last_health_checked_at: null,
        };
        // Optimistically add to cache
        queryClient.setQueryData<CallAgentResponse[]>(agentKeys.list(), (old = []) => [...old, newAgent]);
        console.warn('[Dialflo] API unavailable, agent created locally');
        return [newAgent];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, data, sync }: { agentId: number; data: CallAgentRequestUpdate; sync?: boolean }) => {
      try {
        return await agentsApi.update(agentId, data, sync);
      } catch {
        // Mock: update in cache
        queryClient.setQueryData<CallAgentResponse[]>(agentKeys.list(), (old = []) =>
          old.map(a => a.id === agentId ? { ...a, ...data, updated_at: new Date().toISOString() } : a)
        );
        console.warn('[Dialflo] API unavailable, agent updated locally');
        return {} as CallAgentResponse;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, opts }: { agentId: number; opts?: { disable_only?: boolean; delete_both?: boolean } }) => {
      try {
        return await agentsApi.delete(agentId, opts);
      } catch {
        // Mock: remove from cache
        queryClient.setQueryData<CallAgentResponse[]>(agentKeys.list(), (old = []) =>
          old.filter(a => a.id !== agentId)
        );
        console.warn('[Dialflo] API unavailable, agent deleted locally');
        return {};
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

// ----- Task Agent Queries -----

export function useTaskAgents(agentId: number) {
  return useQuery({
    queryKey: agentKeys.taskAgents(agentId),
    queryFn: () => withFallback(
      () => taskAgentsApi.listByAgent(agentId),
      mockTaskAgents.filter(t => t.agent_id === agentId)
    ),
    enabled: agentId > 0,
  });
}

export function useAllTaskAgents() {
  return useQuery({
    queryKey: agentKeys.allTaskAgents(),
    queryFn: () => withFallback(() => taskAgentsApi.listAll(), mockTaskAgents),
  });
}

export function useTaskAgentByType(agentId: number, taskType: AgentTasks) {
  return useQuery({
    queryKey: [...agentKeys.taskAgents(agentId), taskType],
    queryFn: () => taskAgentsApi.getByType(agentId, taskType),
    enabled: agentId > 0,
  });
}

// ----- Task Agent Mutations -----

export function useCreateTaskAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskAgentRequest) => taskAgentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

export function useUpdateTaskAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, data }: { agentId: number; data: TaskAgentRequestUpdate }) =>
      taskAgentsApi.update(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}
