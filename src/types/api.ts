// ============================================================
// Backend API TypeScript types — mirrors Python Pydantic schemas
// ============================================================

// ----- Enums -----

export type ServerType = 'LOCAL' | 'DEV' | 'QA' | 'PROD' | 'STAGING';
export type CallType = 'INCOMING' | 'OUTGOING';
export type AgentTasks = 'INSIGHT_GENERATION' | 'INSIGHT_QC' | 'CALL_AUDIT';

export type CampaignStatus =
  | 'DRAFTED'
  | 'SCHEDULED'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type CallOutcome =
  | 'ANSWERED'
  | 'FAILED'
  | 'QUEUED'
  | 'NOT_ANSWERED'
  | 'LINE_BUSY'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'CANCELLED';

export type OutcomeReason =
  | 'USER_BUSY'
  | 'USER_REJECTED'
  | 'USER_UNAVAILABLE'
  | 'FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

export type CallDirection = 'inbound' | 'outbound';

// ----- Agents -----

export interface AgentPrompt {
  [key: string]: string | Record<string, string>;
}

export interface AgentWelcomeText {
  [key: string]: string;
}

export interface CallAgentRequest {
  prompt: AgentPrompt;
  agent_name: string;
  agent_phone_number: string;
  voice_id: string;
  welcome_text: AgentWelcomeText;
  enabled?: boolean;
  tools?: unknown[] | null;
  save_stats?: boolean;
  server_type?: ServerType;
  call_type: CallType;
  user_persona?: Record<string, unknown> | null;
}

export interface CallAgentResponse {
  id: number;
  prompt: AgentPrompt;
  agent_name: string;
  agent_phone_number: string;
  voice_id: string;
  version: number;
  welcome_text: AgentWelcomeText;
  tools: unknown[] | null;
  enabled: boolean;
  save_stats: boolean;
  server_type: ServerType;
  call_type: CallType;
  created_at: string;
  updated_at: string;
  user_persona: Record<string, unknown> | null;
  client_id: number | null;
  pair_agent_id: number | null;
  health_monitoring_enabled: boolean;
  health_alert_emails: string[] | null;
  last_health_status: string | null;
  last_health_checked_at: string | null;
}

export interface CallAgentRequestUpdate {
  prompt?: AgentPrompt | null;
  agent_name?: string | null;
  agent_phone_number?: string | null;
  voice_id?: string | null;
  welcome_text?: AgentWelcomeText | null;
  enabled?: boolean | null;
  tools?: unknown[] | null;
  save_stats?: boolean | null;
  server_type?: ServerType | null;
  call_type?: CallType | null;
  user_persona?: Record<string, unknown> | null;
  client_id?: number | null;
  current_version_id?: number | null;
  pair_agent_id?: number | null;
  health_monitoring_enabled?: boolean | null;
  health_alert_emails?: string[] | null;
}

// ----- Agent Health -----

export interface AgentHealthResponse {
  agent_id: number;
  agent_name: string;
  overall_status: string;
  checks: Record<string, unknown>;
}

// ----- Agent Call Stats -----

export interface AgentCallStatsResponse {
  data: CallDetailResponse[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ----- Task Agents -----

export interface TaskAgentRequest {
  prompt: Record<string, string>;
  task_details?: Record<string, unknown> | null;
  agent_name: string;
  agent_task?: AgentTasks;
  enabled: boolean;
  version: number;
  agent_id: number;
}

export interface TaskAgentResponse {
  id: number;
  prompt: Record<string, string>;
  task_details: Record<string, unknown> | null;
  agent_name: string;
  agent_task: AgentTasks;
  enabled: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  agent_id: number;
}

export interface TaskAgentRequestUpdate {
  id?: number;
  prompt?: Record<string, string>;
  task_details?: Record<string, unknown> | null;
  agent_name?: string;
  agent_task?: AgentTasks;
  enabled?: boolean;
  version?: number;
  agent_id?: number;
}

// ----- Voices -----

export interface VoiceOption {
  voice_id: string;
  name: string;
}

// ----- Phone Numbers -----

export interface NumberInfo {
  number: string;
  [key: string]: unknown;
}

// ----- Campaigns -----

export interface PostCallActionFilter {
  call_status?: string[] | null;
  call_disposition?: string[] | null;
}

export interface ScheduleCallConfig {
  delay_value?: number;
  delay_unit?: 'minutes' | 'hours' | 'days';
  agent_name?: string | null;
  max_follow_ups?: number | null;
  use_callback_time?: boolean;
  callback_time_field?: string;
}

export interface PostCallAction {
  action_type: 'schedule_call';
  filters: PostCallActionFilter;
  config: ScheduleCallConfig;
}

export interface PostCallActionsConfig {
  actions: PostCallAction[];
}

export interface CampaignCreateRequest {
  campaign_name: string;
  description: string;
  agent_id: number;
  audience_id: string;
  scheduled_start_time?: string | null;
  post_call_actions?: PostCallActionsConfig | null;
}

export interface CampaignResponse {
  campaign_id: string;
  status: CampaignStatus;
  audience_id: string | null;
  description: string | null;
  campaign_name: string;
  size: number | null;
  created_at: string;
  updated_at: string;
  agent_id: number;
  call_status_summary: Record<string, unknown> | null;
  post_call_actions: PostCallActionsConfig | null;
  start_time: string | null;
  scheduled_start_time: string | null;
  paused_at: string | null;
  cancelled_at: string | null;
  file_url: string | null;
}

export interface CampaignInsightsRequest {
  campaign_id: string;
  [key: string]: unknown;
}

export interface CampaignInsightsResponse {
  [key: string]: unknown;
}

// ----- Audiences -----

export interface AudienceResponse {
  id: string;
  name: string;
  description: string | null;
  file_url: string | null;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  size: number | null;
}

export interface AudienceUpdateRequest {
  name?: string;
  description?: string | null;
}

// ----- Analytics -----

export interface AgentAnalyticsResponse {
  agent_id: number | null;
  total_attempted_calls: number;
  total_dialed_calls: number;
  total_picked_calls: number;
  total_failed_calls: number;
  total_successful_calls: number;
  avg_call_duration: number;
  avg_response_time: number;
  avg_interruptions_per_call: number;
}

export interface AgentAnalyticsOverviewResponse {
  agent_id: number | null;
  total_calls: number;
  answered_calls: number;
  converted_calls: number;
  not_connected_calls: number;
  failed_calls: number;
  pickup_rate: number;
  conversion_rate: number;
  non_connection_rate: number;
  failure_rate: number;
  avg_answered_duration: number;
  median_answered_duration: number;
}

export interface DailyAnalytics {
  date: string;
  total_calls: number;
  answered_calls: number;
  converted_calls: number;
  pickup_rate: number;
  conversion_rate: number;
}

export interface HangupBreakdown {
  [source: string]: number;
}

export interface DashboardDailyCallsResponse {
  summary: {
    total_calls: number;
    from_date: string;
    to_date: string;
  };
  daily: {
    date: string;
    total_calls: number;
    answered_calls: number;
    failed_calls: number;
  }[];
}

// ----- Call Details -----

export interface CallDetailResponse {
  id: number;
  call_id: string;
  agent_name: string | null;
  call_agent_version_id: number | null;
  stt_data: unknown[];
  llm_data: unknown[];
  tts_data: unknown[];
  call_transcription: Record<string, unknown>[];
  call_insights: Record<string, unknown> | null;
  call_recording_url: string | null;
  call_transcript_url: string | null;
  from_number: string | null;
  to_number: string | null;
  call_context: Record<string, unknown> | null;
  call_outcome: CallOutcome | null;
  outcome_reason: OutcomeReason | null;
  call_duration: number | null;
  billed_duration: number | null;
  initiation_time: string | null;
  answer_time: string | null;
  end_time: string | null;
  hangup_cause_name: string | null;
  hangup_source: string | null;
  call_direction: CallDirection | null;
  task_id: number | null;
  call_triggered: boolean | null;
  call_quality: Record<string, unknown> | null;
  call_timeline: Record<string, unknown>[] | null;
  call_state_changes: Record<string, unknown>[];
  turns: Record<string, unknown>[] | null;
}

// ----- Call Insights -----

export interface CallInsightsResponse {
  id: number | null;
  call_id: string | null;
  agent_id: number | null;
  insights_data: Record<string, unknown> | null;
  call_audit: Record<string, unknown> | null;
  call_quality: Record<string, unknown> | null;
  call_context: Record<string, unknown> | null;
  call_disposition: string | null;
  call_summary: string | null;
  is_verified: boolean;
  verified_by: number | null;
  verification_history: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface CallInsightWithStatsResponse extends CallInsightsResponse {
  call_duration: number | null;
  recording_url: string | null;
  transcript_url: string | null;
  call_transcription: Record<string, unknown>[];
  call_timeline: Record<string, unknown>[] | null;
  from_number: string | null;
  to_number: string | null;
  direction: string | null;
  user_number: string | null;
}

export interface PaginatedCallInsightsResponse {
  meta: {
    total: number;
    has_next: boolean;
  };
  data: CallInsightWithStatsResponse[];
}

// ----- User / Auth -----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  access_token: string;
  agents: CallAgentResponse[];
  is_staff: boolean;
  user_type: string;
}
