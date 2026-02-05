// Retry Strategy types for campaigns

export type RetryTemplate = 'NO_ANSWER' | 'DISPOSITION' | 'SHORT_CALL';
export type BackoffMode = 'FIXED' | 'BACKOFF';
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface RetryTrigger {
  statuses?: string[];          // e.g. ["not_answered", "voicemail", "failed"]
  dispositions?: string[];      // campaign-specific list of strings
  durationLessThanSec?: number; // e.g. 30
}

export interface RetryGuardrails {
  stopOnConverted: boolean;
  stopDispositions: string[];   // e.g. ["Do Not Call", "Wrong Number", "Invalid Number"]
  quietHoursEnabled: boolean;
  timezone: string;             // from campaign
  allowedDays: DayOfWeek[];     // default all weekdays
  startHour: string;            // "10:00"
  endHour: string;              // "18:00"
}

export interface RetryStrategy {
  enabled: boolean;
  template: RetryTemplate;
  maxAttempts: number;          // default 3
  minMinutesBetween: number;    // default 30
  backoffMode: BackoffMode;     // default FIXED
  backoffMinutes: number[];     // if BACKOFF: [15, 30, 60]
  trigger: RetryTrigger;
  guardrails: RetryGuardrails;
}

export interface RetryQueueItem {
  id: string;
  leadName: string;
  phoneNumber: string;
  lastOutcome: string;
  attemptsSoFar: number;
  maxAttempts: number;
  nextAttemptAt: string;
  status: 'queued' | 'running' | 'paused' | 'completed' | 'cancelled';
}

// Default retry strategy
export const defaultRetryStrategy: RetryStrategy = {
  enabled: false,
  template: 'NO_ANSWER',
  maxAttempts: 3,
  minMinutesBetween: 30,
  backoffMode: 'FIXED',
  backoffMinutes: [15, 30, 60],
  trigger: {
    statuses: ['not_answered', 'voicemail'],
    dispositions: [],
    durationLessThanSec: 30,
  },
  guardrails: {
    stopOnConverted: true,
    stopDispositions: ['Do Not Call', 'Wrong Number', 'Invalid Number'],
    quietHoursEnabled: true,
    timezone: 'Asia/Kolkata',
    allowedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startHour: '10:00',
    endHour: '18:00',
  },
};

// Template presets
export const retryTemplates: Record<RetryTemplate, { label: string; description: string }> = {
  NO_ANSWER: {
    label: 'No Answer Retry',
    description: 'Retry leads who didn\'t answer or went to voicemail',
  },
  DISPOSITION: {
    label: 'Disposition-based Retry',
    description: 'Retry based on specific call outcomes',
  },
  SHORT_CALL: {
    label: 'Short Call Retry',
    description: 'Retry calls that ended too quickly',
  },
};

// Common status options for NO_ANSWER template
export const callStatusOptions = [
  { value: 'not_answered', label: 'Not Answered' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'failed', label: 'Failed' },
];

// Days of week options
export const daysOfWeek: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
