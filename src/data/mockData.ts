// Mock data for Dialflo Voice Assistant Hub

export type AgentMode = 'inbound' | 'outbound' | 'dual';
export type AgentStatus = 'active' | 'inactive' | 'draft';

export interface InsightConfig {
  enabled: boolean;
  analysisPrompt: string;
  fields: { name: string; type: 'string' | 'number' | 'boolean' | 'enum' }[];
  destinations: { type: 'slack' | 'webhook'; url: string; enabled: boolean }[];
}

export interface VoiceAgent {
  id: string;
  name: string;
  initials: string;
  type: 'voice';
  direction: 'inbound' | 'outbound' | 'webcall';
  agentMode: AgentMode;
  language: string;
  status: AgentStatus;
  updatedAt: string;
  firstMessage: string;
  systemPrompt: string;
  isInterruptible: boolean;
  voiceId: string;
  voiceName: string;
  linkedAgentId?: string; // for dual mode pairs
  syncWithLinked?: boolean;
  insightConfig?: InsightConfig;
  llmProvider?: string;
  sttProvider?: string;
  ttsProvider?: string;
}

export interface InsightAgent {
  id: string;
  name: string;
  initials: string;
  type: 'insight';
  analysisPrompt: string;
  fields: { name: string; type: 'string' | 'number' | 'boolean' | 'enum' }[];
  callsAnalyzed: number;
  updatedAt: string;
}

import { RetryStrategy, defaultRetryStrategy } from '@/types/retryStrategy';

export interface Campaign {
  id: string;
  name: string;
  assistantId: string;
  assistantName: string;
  listId: string;
  listName: string;
  listCount: number;
  scheduleStart: string;
  scheduleEnd: string;
  status: 'running' | 'scheduled' | 'completed' | 'draft' | 'paused';
  attempted: number;
  connected: number;
  answerRate: number;
  conversion: number;
  avgDuration: number;
  totalCost: number;
  insightAgentId?: string;
  lastInsightRun?: string;
  dispositions: string[];
  retryStrategy?: RetryStrategy;
}

export interface CallRecord {
  id: string;
  calledAt: string;
  calleeName: string;
  calleePhone: string;
  assistantId: string;
  assistantName: string;
  campaignId?: string;
  campaignName?: string;
  status: 'connected' | 'voicemail' | 'not_answered' | 'failed';
  direction: 'inbound' | 'outbound';
  duration: number;
  cost: number;
  disposition: string;
  transcript?: string;
  recordingUrl?: string;
  extractedFields?: Record<string, string | number | boolean>;
}

export interface ContactList {
  id: string;
  name: string;
  records: number;
  updatedAt: string;
  source: 'csv' | 'api' | 'manual';
  tags?: string[];
}

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  category: 'most_used' | 'neutral';
  preview?: string;
}

// Voice options
export const voices: Voice[] = [
  { id: 'v1', name: 'Sarah', gender: 'female', accent: 'American', category: 'most_used' },
  { id: 'v2', name: 'James', gender: 'male', accent: 'British', category: 'most_used' },
  { id: 'v3', name: 'Priya', gender: 'female', accent: 'Indian', category: 'most_used' },
  { id: 'v4', name: 'Michael', gender: 'male', accent: 'American', category: 'most_used' },
  { id: 'v5', name: 'Emma', gender: 'female', accent: 'British', category: 'neutral' },
  { id: 'v6', name: 'Alex', gender: 'neutral', accent: 'American', category: 'neutral' },
  { id: 'v7', name: 'Raj', gender: 'male', accent: 'Indian', category: 'neutral' },
  { id: 'v8', name: 'Sophie', gender: 'female', accent: 'Australian', category: 'neutral' },
];

// Mock Voice Agents
export const voiceAgents: VoiceAgent[] = [
  {
    id: 'va1',
    name: 'Sales Qualifier',
    initials: 'SQ',
    type: 'voice',
    direction: 'outbound',
    agentMode: 'outbound',
    language: 'English',
    status: 'active',
    updatedAt: '1 hour ago',
    firstMessage: 'Hi, this is Sarah from TechCorp. Am I speaking with {{name}}?',
    systemPrompt: 'You are a professional sales qualification agent. Your goal is to qualify leads based on budget, authority, need, and timeline.',
    isInterruptible: true,
    voiceId: 'v1',
    voiceName: 'Sarah',
    llmProvider: 'openai',
    sttProvider: 'deepgram',
    ttsProvider: 'elevenlabs',
    insightConfig: {
      enabled: true,
      analysisPrompt: 'Analyze the sales call and extract key information about the prospect\'s interest level, objections raised, and next steps agreed upon.',
      fields: [
        { name: 'interest_level', type: 'enum' },
        { name: 'budget_mentioned', type: 'boolean' },
        { name: 'main_objection', type: 'string' },
        { name: 'follow_up_date', type: 'string' },
      ],
      destinations: [{ type: 'slack', url: '#sales-insights', enabled: true }],
    },
  },
  {
    id: 'va2',
    name: 'Customer Support',
    initials: 'CS',
    type: 'voice',
    direction: 'inbound',
    agentMode: 'inbound',
    language: 'English',
    status: 'active',
    updatedAt: '30 mins ago',
    firstMessage: 'Thank you for calling TechCorp support. How can I help you today?',
    systemPrompt: 'You are a helpful customer support agent. Help customers with their issues professionally and efficiently.',
    isInterruptible: true,
    voiceId: 'v2',
    voiceName: 'James',
    llmProvider: 'anthropic',
    sttProvider: 'deepgram',
    ttsProvider: 'elevenlabs',
    insightConfig: {
      enabled: true,
      analysisPrompt: 'Extract support ticket details including issue type, severity, resolution status, and customer satisfaction.',
      fields: [
        { name: 'issue_type', type: 'string' },
        { name: 'severity', type: 'enum' },
        { name: 'resolved', type: 'boolean' },
        { name: 'csat_score', type: 'number' },
      ],
      destinations: [],
    },
  },
  {
    id: 'va3',
    name: 'Appointment Setter',
    initials: 'AS',
    type: 'voice',
    direction: 'outbound',
    agentMode: 'outbound',
    language: 'English',
    status: 'active',
    updatedAt: '2 hours ago',
    firstMessage: 'Hello {{name}}, I\'m calling to schedule your consultation with our team.',
    systemPrompt: 'You are an appointment scheduling assistant. Book meetings with qualified prospects.',
    isInterruptible: false,
    voiceId: 'v4',
    voiceName: 'Michael',
  },
  {
    id: 'va4',
    name: 'Survey Bot',
    initials: 'SB',
    type: 'voice',
    direction: 'outbound',
    agentMode: 'outbound',
    language: 'Hindi',
    status: 'inactive',
    updatedAt: '1 day ago',
    firstMessage: 'नमस्ते {{name}}, हम आपकी प्रतिक्रिया लेना चाहते हैं।',
    systemPrompt: 'Conduct customer satisfaction surveys in Hindi. Be polite and collect NPS scores.',
    isInterruptible: true,
    voiceId: 'v3',
    voiceName: 'Priya',
  },
  {
    id: 'va5',
    name: 'Lead Nurture',
    initials: 'LN',
    type: 'voice',
    direction: 'outbound',
    agentMode: 'outbound',
    language: 'English',
    status: 'active',
    updatedAt: '3 hours ago',
    firstMessage: 'Hi {{name}}, following up on your interest in our services.',
    systemPrompt: 'Nurture warm leads with personalized follow-ups. Build rapport and move towards conversion.',
    isInterruptible: true,
    voiceId: 'v1',
    voiceName: 'Sarah',
  },
  {
    id: 'va6',
    name: 'Payment Reminder',
    initials: 'PR',
    type: 'voice',
    direction: 'outbound',
    agentMode: 'outbound',
    language: 'English',
    status: 'active',
    updatedAt: '45 mins ago',
    firstMessage: 'Hello {{name}}, this is a reminder about your upcoming payment.',
    systemPrompt: 'Remind customers about pending payments professionally. Offer payment options and collect commitments.',
    isInterruptible: false,
    voiceId: 'v2',
    voiceName: 'James',
  },
  {
    id: 'va7',
    name: 'Web Consultant',
    initials: 'WC',
    type: 'voice',
    direction: 'webcall',
    agentMode: 'inbound',
    language: 'English',
    status: 'draft',
    updatedAt: '5 hours ago',
    firstMessage: 'Welcome to our website! How can I assist you today?',
    systemPrompt: 'Help website visitors with product questions and guide them through the purchase process.',
    isInterruptible: true,
    voiceId: 'v5',
    voiceName: 'Emma',
  },
  {
    id: 'va8',
    name: 'Demo Scheduler',
    initials: 'DS',
    type: 'voice',
    direction: 'outbound',
    agentMode: 'dual',
    language: 'English',
    status: 'active',
    updatedAt: '2 days ago',
    firstMessage: 'Hi {{name}}, I\'d love to show you a demo of our platform.',
    systemPrompt: 'Schedule product demos with interested prospects. Qualify them during the conversation.',
    isInterruptible: true,
    voiceId: 'v4',
    voiceName: 'Michael',
    linkedAgentId: 'va8-inbound',
    syncWithLinked: true,
  },
];

// Mock Insight Agents
export const insightAgents: InsightAgent[] = [
  {
    id: 'ia1',
    name: 'Sales Call Analyzer',
    initials: 'SA',
    type: 'insight',
    analysisPrompt: 'Analyze the sales call and extract key information about the prospect\'s interest level, objections raised, and next steps agreed upon.',
    fields: [
      { name: 'interest_level', type: 'enum' },
      { name: 'budget_mentioned', type: 'boolean' },
      { name: 'main_objection', type: 'string' },
      { name: 'follow_up_date', type: 'string' },
    ],
    callsAnalyzed: 1234,
    updatedAt: '2 hours ago',
  },
  {
    id: 'ia2',
    name: 'Support Ticket Extractor',
    initials: 'ST',
    type: 'insight',
    analysisPrompt: 'Extract support ticket details including issue type, severity, resolution status, and customer satisfaction.',
    fields: [
      { name: 'issue_type', type: 'string' },
      { name: 'severity', type: 'enum' },
      { name: 'resolved', type: 'boolean' },
      { name: 'csat_score', type: 'number' },
    ],
    callsAnalyzed: 2567,
    updatedAt: '1 hour ago',
  },
  {
    id: 'ia3',
    name: 'NPS Scorer',
    initials: 'NP',
    type: 'insight',
    analysisPrompt: 'Extract NPS score and categorize customer feedback into promoter, passive, or detractor.',
    fields: [
      { name: 'nps_score', type: 'number' },
      { name: 'category', type: 'enum' },
      { name: 'feedback_summary', type: 'string' },
    ],
    callsAnalyzed: 892,
    updatedAt: '3 hours ago',
  },
  {
    id: 'ia4',
    name: 'Appointment Validator',
    initials: 'AV',
    type: 'insight',
    analysisPrompt: 'Verify if an appointment was successfully scheduled and extract the date, time, and attendee confirmations.',
    fields: [
      { name: 'appointment_set', type: 'boolean' },
      { name: 'appointment_date', type: 'string' },
      { name: 'attendees_confirmed', type: 'number' },
    ],
    callsAnalyzed: 456,
    updatedAt: '5 hours ago',
  },
];

// Mock Contact Lists
export const contactLists: ContactList[] = [
  { id: 'l1', name: 'Q1 Sales Leads', records: 2450, updatedAt: '2 hours ago', source: 'csv', tags: ['sales', 'q1'] },
  { id: 'l2', name: 'Support Follow-ups', records: 892, updatedAt: '1 day ago', source: 'api', tags: ['support'] },
  { id: 'l3', name: 'Webinar Attendees', records: 1234, updatedAt: '3 days ago', source: 'csv', tags: ['marketing', 'webinar'] },
  { id: 'l4', name: 'Trial Users', records: 567, updatedAt: '1 week ago', source: 'api', tags: ['product', 'trial'] },
  { id: 'l5', name: 'Payment Due', records: 234, updatedAt: '5 hours ago', source: 'csv', tags: ['collections'] },
  { id: 'l6', name: 'Enterprise Prospects', records: 89, updatedAt: '2 days ago', source: 'manual', tags: ['enterprise', 'high-value'] },
];

// Campaign-specific dispositions
const salesDispositions = ['Interested', 'Not Interested', 'Callback Requested', 'Appointment Set', 'Do Not Call', 'Wrong Number', 'Invalid Number'];
const supportDispositions = ['Issue Resolved', 'Escalated', 'Callback Requested', 'Information Provided', 'Do Not Call', 'Wrong Number'];
const collectionDispositions = ['Payment Committed', 'Partial Payment', 'Callback Requested', 'Dispute', 'Do Not Call', 'Wrong Number', 'Invalid Number'];

// Mock Campaigns
export const campaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Q1 Outreach Campaign',
    assistantId: 'va1',
    assistantName: 'Sales Qualifier',
    listId: 'l1',
    listName: 'Q1 Sales Leads',
    listCount: 2450,
    scheduleStart: '2024-01-15T09:00:00',
    scheduleEnd: '2024-01-31T18:00:00',
    status: 'running',
    attempted: 1247,
    connected: 892,
    answerRate: 71.5,
    conversion: 18.2,
    avgDuration: 245,
    totalCost: 1234.50,
    insightAgentId: 'ia1',
    lastInsightRun: '2 hours ago',
    dispositions: salesDispositions,
    retryStrategy: {
      enabled: true,
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
    },
  },
  {
    id: 'c2',
    name: 'Payment Reminders Feb',
    assistantId: 'va6',
    assistantName: 'Payment Reminder',
    listId: 'l5',
    listName: 'Payment Due',
    listCount: 234,
    scheduleStart: '2024-02-01T10:00:00',
    scheduleEnd: '2024-02-15T17:00:00',
    status: 'scheduled',
    attempted: 0,
    connected: 0,
    answerRate: 0,
    conversion: 0,
    avgDuration: 0,
    totalCost: 0,
    dispositions: collectionDispositions,
    retryStrategy: {
      enabled: true,
      template: 'DISPOSITION',
      maxAttempts: 5,
      minMinutesBetween: 60,
      backoffMode: 'BACKOFF',
      backoffMinutes: [30, 60, 120],
      trigger: {
        statuses: [],
        dispositions: ['Callback Requested'],
        durationLessThanSec: 30,
      },
      guardrails: {
        stopOnConverted: true,
        stopDispositions: ['Payment Committed', 'Do Not Call', 'Wrong Number'],
        quietHoursEnabled: true,
        timezone: 'Asia/Kolkata',
        allowedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startHour: '09:00',
        endHour: '19:00',
      },
    },
  },
  {
    id: 'c3',
    name: 'Webinar Follow-up',
    assistantId: 'va5',
    assistantName: 'Lead Nurture',
    listId: 'l3',
    listName: 'Webinar Attendees',
    listCount: 1234,
    scheduleStart: '2024-01-10T09:00:00',
    scheduleEnd: '2024-01-12T18:00:00',
    status: 'completed',
    attempted: 1234,
    connected: 987,
    answerRate: 80.0,
    conversion: 24.5,
    avgDuration: 312,
    totalCost: 2456.00,
    insightAgentId: 'ia1',
    lastInsightRun: '3 days ago',
    dispositions: salesDispositions,
  },
  {
    id: 'c4',
    name: 'Enterprise Demo Calls',
    assistantId: 'va8',
    assistantName: 'Demo Scheduler',
    listId: 'l6',
    listName: 'Enterprise Prospects',
    listCount: 89,
    scheduleStart: '2024-02-05T09:00:00',
    scheduleEnd: '2024-02-20T17:00:00',
    status: 'draft',
    attempted: 0,
    connected: 0,
    answerRate: 0,
    conversion: 0,
    avgDuration: 0,
    totalCost: 0,
    dispositions: salesDispositions,
  },
  {
    id: 'c5',
    name: 'Trial Activation',
    assistantId: 'va3',
    assistantName: 'Appointment Setter',
    listId: 'l4',
    listName: 'Trial Users',
    listCount: 567,
    scheduleStart: '2024-01-20T09:00:00',
    scheduleEnd: '2024-01-25T18:00:00',
    status: 'paused',
    attempted: 234,
    connected: 156,
    answerRate: 66.7,
    conversion: 12.8,
    avgDuration: 198,
    totalCost: 567.00,
    insightAgentId: 'ia4',
    lastInsightRun: '1 day ago',
    dispositions: salesDispositions,
    retryStrategy: {
      enabled: true,
      template: 'SHORT_CALL',
      maxAttempts: 2,
      minMinutesBetween: 15,
      backoffMode: 'FIXED',
      backoffMinutes: [15, 30, 60],
      trigger: {
        statuses: [],
        dispositions: [],
        durationLessThanSec: 20,
      },
      guardrails: {
        stopOnConverted: true,
        stopDispositions: ['Appointment Set', 'Do Not Call'],
        quietHoursEnabled: true,
        timezone: 'Asia/Kolkata',
        allowedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startHour: '10:00',
        endHour: '18:00',
      },
    },
  },
  {
    id: 'c6',
    name: 'Customer Survey Q4',
    assistantId: 'va4',
    assistantName: 'Survey Bot',
    listId: 'l2',
    listName: 'Support Follow-ups',
    listCount: 892,
    scheduleStart: '2023-12-01T09:00:00',
    scheduleEnd: '2023-12-15T18:00:00',
    status: 'completed',
    attempted: 892,
    connected: 654,
    answerRate: 73.3,
    conversion: 45.2,
    avgDuration: 178,
    totalCost: 1890.00,
    insightAgentId: 'ia3',
    dispositions: supportDispositions,
    lastInsightRun: '1 month ago',
  },
];

// Mock Call Records
const dispositions = ['Interested', 'Not Interested', 'Callback Requested', 'Wrong Number', 'Appointment Set', 'Information Sent', 'Qualified', 'Unqualified', 'Do Not Call'];
const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh', 'Neha Gupta', 'Arjun Nair', 'Meera Iyer', 'Karan Malhotra', 'Anjali Desai'];

function generatePhoneNumber(): string {
  return `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

function generateCallTime(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 10 + 9));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

export const callRecords: CallRecord[] = Array.from({ length: 60 }, (_, i): CallRecord => {
  const statuses: CallRecord['status'][] = ['connected', 'connected', 'connected', 'voicemail', 'not_answered', 'failed'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const agent = voiceAgents[Math.floor(Math.random() * voiceAgents.length)];
  const campaign = Math.random() > 0.3 ? campaigns[Math.floor(Math.random() * campaigns.length)] : null;
  
  return {
    id: `call-${i + 1}`,
    calledAt: generateCallTime(Math.floor(Math.random() * 30)),
    calleeName: names[Math.floor(Math.random() * names.length)],
    calleePhone: generatePhoneNumber(),
    assistantId: agent.id,
    assistantName: agent.name,
    campaignId: campaign?.id,
    campaignName: campaign?.name,
    status,
    direction: agent.direction === 'inbound' ? 'inbound' as const : 'outbound' as const,
    duration: status === 'connected' ? Math.floor(Math.random() * 600 + 30) : 0,
    cost: status === 'connected' ? Math.round((Math.random() * 5 + 0.5) * 100) / 100 : 0,
    disposition: dispositions[Math.floor(Math.random() * dispositions.length)],
    transcript: status === 'connected' ? 'Agent: Hello, this is a sample transcript...\nCustomer: Hi, I\'m interested...\nAgent: Great! Let me tell you more...' : undefined,
    extractedFields: status === 'connected' && Math.random() > 0.3 ? {
      interest_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
      budget_mentioned: Math.random() > 0.5,
      main_objection: ['Price', 'Timing', 'Features', 'None'][Math.floor(Math.random() * 4)],
    } : undefined,
  };
}).sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());

// Analytics data
export const analyticsData = {
  totalAttempted: 4827,
  totalConnected: 3456,
  notAnswered: 1124,
  converted: 687,
  avgDuration: 234,
  totalCost: 8234.50,
  
  callsOverTime: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const attempted = Math.floor(Math.random() * 200 + 100);
    const connected = Math.floor(attempted * (Math.random() * 0.3 + 0.5));
    return {
      date: date.toISOString().split('T')[0],
      attempted,
      connected,
      conversionRate: Math.round((connected / attempted) * 100 * (Math.random() * 0.4 + 0.1)),
    };
  }),
  
  dispositionBreakdown: [
    { name: 'Interested', count: 892, percentage: 26 },
    { name: 'Not Interested', count: 756, percentage: 22 },
    { name: 'Callback Requested', count: 534, percentage: 15 },
    { name: 'Appointment Set', count: 423, percentage: 12 },
    { name: 'Information Sent', count: 312, percentage: 9 },
    { name: 'Wrong Number', count: 234, percentage: 7 },
    { name: 'Other', count: 305, percentage: 9 },
  ],
};

// Phone numbers for test calls
export const phoneNumbers = [
  { id: 'n1', number: '+91 9876543210', label: 'Primary' },
  { id: 'n2', number: '+91 9876543211', label: 'Secondary' },
  { id: 'n3', number: '+1 555-0123', label: 'US Number' },
];
