// ============================================================
// Centralized API client for Dialflo Backend
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || '';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Build query string from params, skipping undefined/null values
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  const qs = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  ).toString();
  return `?${qs}`;
}

/**
 * Core fetch wrapper with auth header, error handling, and JSON parsing
 */
async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...restOptions } = options;
  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(AUTH_TOKEN ? { auth_token: `Bearer ${AUTH_TOKEN}` } : {}),
    ...(customHeaders as Record<string, string> || {}),
  };

  const config: RequestInit = {
    ...restOptions,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.detail?.message || errorData?.detail || errorMessage;
    } catch {
      // Ignore parse error
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Verify response is actually JSON before parsing
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('API returned non-JSON response. Is the backend running?');
  }

  return response.json();
}

/**
 * Upload file with multipart/form-data
 */
async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...(AUTH_TOKEN ? { auth_token: `Bearer ${AUTH_TOKEN}` } : {}),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.detail?.message || errorData?.detail || errorMessage;
    } catch {
      // Ignore parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ============================================================
// AGENTS API
// ============================================================

import type {
  CallAgentResponse,
  CallAgentRequest,
  CallAgentRequestUpdate,
  AgentHealthResponse,
  VoiceOption,
  NumberInfo,
  TaskAgentResponse,
  TaskAgentRequest,
  TaskAgentRequestUpdate,
  AgentTasks,
} from '@/types/api';

export const agentsApi = {
  /** List all agents */
  list: (params?: { enabled?: boolean; phone_number?: string }) =>
    apiFetch<CallAgentResponse[]>('/agents', { params }),

  /** Get agent by ID */
  get: (agentId: number) =>
    apiFetch<CallAgentResponse[]>(`/agents/${agentId}`),

  /** Create agent */
  create: (data: CallAgentRequest) =>
    apiFetch<CallAgentResponse[]>('/agents', { method: 'POST', body: data }),

  /** Update agent */
  update: (agentId: number, data: CallAgentRequestUpdate, sync?: boolean) =>
    apiFetch<CallAgentResponse>(`/agents/${agentId}`, {
      method: 'PATCH',
      body: data,
      params: sync !== undefined ? { sync } : undefined,
    }),

  /** Delete / disable agent */
  delete: (agentId: number, opts?: { disable_only?: boolean; delete_both?: boolean }) =>
    apiFetch<Record<string, unknown>>(`/agents/${agentId}`, {
      method: 'DELETE',
      params: opts,
    }),

  /** List available voices */
  voices: () => apiFetch<VoiceOption[]>('/agents/voices'),

  /** Get phone number info */
  numbers: () => apiFetch<NumberInfo[]>('/agents/numbers'),

  /** Check phone number availability */
  checkNumberAvailability: (phoneNumber: string, callType?: string) =>
    apiFetch<Record<string, unknown>>(`/agents/check-number-availability/${phoneNumber}`, {
      params: callType ? { call_type: callType } : undefined,
    }),

  /** Check if agent name exists */
  checkName: (name: string) =>
    apiFetch<Record<string, unknown>>('/agents/check-name', { params: { name } }),

  /** Run health checks for agent */
  health: (agentId: number) =>
    apiFetch<AgentHealthResponse>(`/agents/${agentId}/health`),

  /** Get call statistics for agent */
  callStats: (agentId: number, params?: {
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    call_type?: string;
    min_duration?: number;
    max_duration?: number;
  }) =>
    apiFetch<Record<string, unknown>>(`/agents/${agentId}/call_stats`, { params }),

  /** Generate dynamic prompt from template */
  dynamicPrompt: (agentId: number, data: { prompt_template: string; data: Record<string, unknown> }) =>
    apiFetch<string>(`/agents/${agentId}/dynamic_prompt`, { method: 'POST', body: data }),
};

// ============================================================
// TASK AGENTS API
// ============================================================

export const taskAgentsApi = {
  /** Get all task agents */
  listAll: () =>
    apiFetch<TaskAgentResponse[]>('/agents/task_agents'),

  /** Create task agent */
  create: (data: TaskAgentRequest) =>
    apiFetch<unknown[]>('/agents/task_agents', { method: 'POST', body: data }),

  /** Get task agents for specific agent */
  listByAgent: (agentId: number) =>
    apiFetch<TaskAgentResponse[]>(`/agents/${agentId}/task_agents`),

  /** Get task agent by type */
  getByType: (agentId: number, taskType: AgentTasks) =>
    apiFetch<TaskAgentResponse>(`/agents/${agentId}/task_agents/by-type`, {
      params: { task_type: taskType },
    }),

  /** Update task agent */
  update: (agentId: number, data: TaskAgentRequestUpdate) =>
    apiFetch<TaskAgentResponse>(`/agents/${agentId}/task_agents`, {
      method: 'PATCH',
      body: data,
    }),
};

// ============================================================
// CAMPAIGNS API
// ============================================================

import type {
  CampaignResponse,
  CampaignCreateRequest,
  CampaignInsightsRequest,
  CampaignInsightsResponse,
} from '@/types/api';

export const campaignsApi = {
  /** List all campaigns */
  list: () => apiFetch<CampaignResponse[]>('/api/v1/campaign'),

  /** Get campaign by ID */
  get: (campaignId: string) =>
    apiFetch<CampaignResponse>(`/api/v1/campaign/${campaignId}`),

  /** Create campaign */
  create: (data: CampaignCreateRequest) =>
    apiFetch<CampaignResponse>('/api/v1/campaign/create', { method: 'POST', body: data }),

  /** Trigger campaign */
  trigger: (campaignId: string) =>
    apiFetch<Record<string, unknown>>('/api/v1/campaign/trigger', {
      method: 'POST',
      body: { campaign_id: campaignId },
    }),

  /** Pause campaign */
  pause: (campaignId: string) =>
    apiFetch<CampaignResponse>(`/api/v1/campaign/${campaignId}/pause`, { method: 'POST' }),

  /** Cancel campaign */
  cancel: (campaignId: string) =>
    apiFetch<CampaignResponse>(`/api/v1/campaign/${campaignId}/cancel`, { method: 'POST' }),

  /** Resume campaign */
  resume: (campaignId: string) =>
    apiFetch<CampaignResponse>(`/api/v1/campaign/${campaignId}/resume`, { method: 'POST' }),

  /** Delete campaign */
  delete: (campaignId: string) =>
    apiFetch<Record<string, unknown>>(`/api/v1/campaign/${campaignId}/delete`, { method: 'DELETE' }),

  /** Generate campaign insights */
  insights: (data: CampaignInsightsRequest) =>
    apiFetch<CampaignInsightsResponse>('/api/v1/campaign/insights', { method: 'POST', body: data }),

  /** Get disposition summary for campaign */
  dispositions: (campaignId: string) =>
    apiFetch<Record<string, unknown>>(`/api/v1/campaign/${campaignId}/dispositions`),
};

// ============================================================
// AUDIENCES API
// ============================================================

import type { AudienceResponse, AudienceUpdateRequest } from '@/types/api';

export const audiencesApi = {
  /** List all audiences */
  list: () => apiFetch<AudienceResponse[]>('/api/v1/audience'),

  /** Get audience by ID */
  get: (audienceId: string) =>
    apiFetch<AudienceResponse>(`/api/v1/audience/${audienceId}`),

  /** Create audience (with optional file upload) */
  create: (name: string, description?: string, file?: File) => {
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (file) formData.append('file', file);
    return apiUpload<AudienceResponse>('/api/v1/audience', formData);
  },

  /** Update audience */
  update: (audienceId: string, data: AudienceUpdateRequest) =>
    apiFetch<AudienceResponse>(`/api/v1/audience/${audienceId}`, { method: 'PUT', body: data }),

  /** Delete audience */
  delete: (audienceId: string) =>
    apiFetch<Record<string, unknown>>(`/api/v1/audience/${audienceId}`, { method: 'DELETE' }),
};

// ============================================================
// ANALYTICS API
// ============================================================

import type {
  AgentAnalyticsResponse,
  AgentAnalyticsOverviewResponse,
  DailyAnalytics,
  HangupBreakdown,
  DashboardDailyCallsResponse,
} from '@/types/api';

export const analyticsApi = {
  /** Get agent analytics stats */
  agentStats: (agentId: number, params?: { from_date?: string; to_date?: string }) =>
    apiFetch<AgentAnalyticsResponse>(`/agents/${agentId}/analytics/stats`, { params }),

  /** Get agent analytics overview */
  agentOverview: (agentId: number, params?: {
    from_date?: string;
    to_date?: string;
    call_direction?: string;
    exclude_internal_calls?: boolean;
  }) =>
    apiFetch<AgentAnalyticsOverviewResponse>(`/agents/${agentId}/analytics/overview`, { params }),

  /** Get daily analytics breakdown for agent */
  agentDaily: (agentId: number, params?: {
    from_date?: string;
    to_date?: string;
    call_direction?: string;
    exclude_internal_calls?: boolean;
  }) =>
    apiFetch<DailyAnalytics[]>(`/agents/${agentId}/analytics/daily`, { params }),

  /** Get hangup breakdown for agent */
  agentHangupBreakdown: (agentId: number, params?: {
    from_date?: string;
    to_date?: string;
    call_direction?: string;
    exclude_internal_calls?: boolean;
  }) =>
    apiFetch<HangupBreakdown>(`/agents/${agentId}/analytics/hangup-breakdown`, { params }),

  /** Get global daily call stats across all agents */
  dashboardDailyCalls: (params?: {
    days?: number;
    from_date?: string;
    to_date?: string;
    exclude_internal_calls?: boolean;
  }) =>
    apiFetch<DashboardDailyCallsResponse>('/dashboard/analytics/daily-calls', { params }),
};

// ============================================================
// CALLS API
// ============================================================

import type {
  CallDetailResponse,
  PaginatedCallInsightsResponse,
  CallInsightWithStatsResponse,
} from '@/types/api';

export const callsApi = {
  /** Get all call details */
  list: () => apiFetch<CallDetailResponse[]>('/call_details'),

  /** Get call details by task UUID */
  getByTaskUuid: (taskUuid: string, params?: { refetch?: boolean; internal?: boolean }) =>
    apiFetch<CallDetailResponse>(`/call_details/${taskUuid}`, { params }),

  /** Get call recording */
  getRecording: (callUuid: string) =>
    `${API_BASE_URL}/call_recording?call_uuid=${callUuid}`,

  /** Make outbound call */
  makeCall: (data: Record<string, unknown>, priority?: string) =>
    apiFetch<{ call_id: string; task_uuid: string }>('/make_call', {
      method: 'POST',
      body: data,
      params: priority ? { priority } : undefined,
    }),
};

// ============================================================
// CALL INSIGHTS API (v2)
// ============================================================

export const callInsightsApi = {
  /** Get all call insights (paginated) */
  list: (params?: {
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
  }) =>
    apiFetch<PaginatedCallInsightsResponse>('/v2/call_insights/', { params }),

  /** Get call insight by ID */
  get: (insightId: number) =>
    apiFetch<CallInsightWithStatsResponse>(`/v2/call_insights/${insightId}`),

  /** Get call insights by call ID */
  getByCallId: (callId: string) =>
    apiFetch<CallInsightWithStatsResponse[]>(`/v2/call_insights/call/${callId}`),

  /** Update call insight */
  update: (callId: string, data: Record<string, unknown>) =>
    apiFetch<CallInsightWithStatsResponse>(`/v2/call_insights/${callId}`, {
      method: 'PATCH',
      body: data,
    }),

  /** Delete call insight */
  delete: (insightId: number) =>
    apiFetch<Record<string, unknown>>(`/v2/call_insights/${insightId}`, { method: 'DELETE' }),
};
