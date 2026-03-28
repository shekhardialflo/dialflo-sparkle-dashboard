export interface ScenarioUtterance {
  step: string;
  lines: string[];
}

export interface ScenarioEdgeCase {
  title: string;
  example: string;
  frequency: string;
}

export interface ScenarioFlowNode {
  id: string;
  type: 'question' | 'condition' | 'action' | 'end';
  label: string;
  branches?: { label: string; targetId: string }[];
}

export interface RepresentativeCall {
  callId: string;
  duration: string;
  language: string;
  outcome: string;
}

export interface Scenario {
  id: string;
  name: string;
  callCount: number;
  percentage: number;
  goal: string;
  trigger: string;
  patterns: string[];
  commonOutcome: string;
  confidence: number;
  goalDetail: {
    business: string;
    agentTask: string;
    expectedOutcome: string;
  };
  triggerDetail: string;
  flow: ScenarioFlowNode[];
  utterances: ScenarioUtterance[];
  informationCaptured: string[];
  edgeCases: ScenarioEdgeCase[];
  outcomes: string[];
  representativeCalls: RepresentativeCall[];
}

export const mockScenarios: Scenario[] = [
  {
    id: 'sc-1',
    name: 'Delivery Status Inquiry',
    callCount: 28,
    percentage: 32,
    goal: 'Help customer track their order delivery status',
    trigger: 'Customer calls to check when their order will arrive',
    patterns: [
      'Customer provides order ID upfront',
      'Agent checks system and gives ETA',
      'Customer asks for callback if delayed',
    ],
    commonOutcome: 'Resolved',
    confidence: 94,
    goalDetail: {
      business: 'Reduce inbound call volume for delivery queries',
      agentTask: 'Look up order status and provide accurate ETA',
      expectedOutcome: 'Customer gets delivery timeline without escalation',
    },
    triggerDetail: "Customer places an order and hasn't received it within expected window, or tracking shows no movement.",
    flow: [
      { id: '1', type: 'action', label: 'Greet customer', branches: [{ label: '', targetId: '2' }] },
      { id: '2', type: 'question', label: 'Ask for Order ID', branches: [{ label: 'Provided', targetId: '3' }, { label: 'Not available', targetId: '2a' }] },
      { id: '2a', type: 'action', label: 'Ask for phone/email to look up', branches: [{ label: '', targetId: '3' }] },
      { id: '3', type: 'condition', label: 'Order found?', branches: [{ label: 'Yes', targetId: '4' }, { label: 'No', targetId: '3a' }] },
      { id: '3a', type: 'action', label: 'Escalate to support', branches: [{ label: '', targetId: '7' }] },
      { id: '4', type: 'action', label: 'Share delivery ETA', branches: [{ label: '', targetId: '5' }] },
      { id: '5', type: 'condition', label: 'Customer satisfied?', branches: [{ label: 'Yes', targetId: '6' }, { label: 'No', targetId: '5a' }] },
      { id: '5a', type: 'action', label: 'Offer callback / escalate', branches: [{ label: '', targetId: '7' }] },
      { id: '6', type: 'action', label: 'Confirm & close', branches: [{ label: '', targetId: '7' }] },
      { id: '7', type: 'end', label: 'End call' },
    ],
    utterances: [
      { step: 'Opening', lines: ["Hi, I'm calling to check on my order.", 'Hello, can you tell me where my delivery is?'] },
      { step: 'Identity Confirmation', lines: ['My order number is ORD-4821.', 'I placed it on the 15th, name is Rajesh.'] },
      { step: 'Status Check', lines: ['When will it arrive?', "It's been 5 days already."] },
      { step: 'Closing', lines: ['Okay, thank you for the update.', "Please call me if there's any delay."] },
    ],
    informationCaptured: ['Order ID', 'Customer Name', 'Phone Number', 'Delivery Address', 'Expected ETA', 'Callback Preference'],
    edgeCases: [
      { title: 'Invalid Order ID', example: '"My order ID is 999-XXX" — not in system', frequency: '8%' },
      { title: 'Abusive Language', example: '"This is ridiculous, where is my stuff!"', frequency: '3%' },
      { title: 'Multiple Orders', example: '"I have 3 orders, which one are you looking at?"', frequency: '5%' },
    ],
    outcomes: ['Resolved', 'Callback Scheduled', 'Escalated to Support', 'Unreachable'],
    representativeCalls: [
      { callId: 'CALL-1821', duration: '3:42', language: 'English', outcome: 'Resolved' },
      { callId: 'CALL-1834', duration: '5:10', language: 'Hindi', outcome: 'Callback Scheduled' },
      { callId: 'CALL-1847', duration: '2:18', language: 'English', outcome: 'Resolved' },
    ],
  },
  {
    id: 'sc-2',
    name: 'Payment & Refund Query',
    callCount: 22,
    percentage: 25,
    goal: 'Resolve payment failures or process refund requests',
    trigger: 'Customer faces payment issue or wants a refund',
    patterns: [
      'Customer describes payment failure details',
      'Agent verifies transaction in system',
      'Refund initiated or alternative payment suggested',
    ],
    commonOutcome: 'Refund Initiated',
    confidence: 89,
    goalDetail: {
      business: 'Minimize refund escalations and retain customers',
      agentTask: 'Verify payment, diagnose issue, process refund if eligible',
      expectedOutcome: 'Customer gets refund confirmation or payment fix',
    },
    triggerDetail: 'Payment deducted but order not confirmed, or product returned and refund not received.',
    flow: [
      { id: '1', type: 'action', label: 'Greet & identify issue type', branches: [{ label: '', targetId: '2' }] },
      { id: '2', type: 'condition', label: 'Payment failure or Refund?', branches: [{ label: 'Payment', targetId: '3' }, { label: 'Refund', targetId: '4' }] },
      { id: '3', type: 'action', label: 'Check transaction status', branches: [{ label: '', targetId: '5' }] },
      { id: '4', type: 'action', label: 'Verify return & eligibility', branches: [{ label: '', targetId: '5' }] },
      { id: '5', type: 'condition', label: 'Eligible for resolution?', branches: [{ label: 'Yes', targetId: '6' }, { label: 'No', targetId: '5a' }] },
      { id: '5a', type: 'action', label: 'Explain policy & escalate', branches: [{ label: '', targetId: '7' }] },
      { id: '6', type: 'action', label: 'Process refund / fix payment', branches: [{ label: '', targetId: '7' }] },
      { id: '7', type: 'end', label: 'End call' },
    ],
    utterances: [
      { step: 'Opening', lines: ['My payment was deducted but order shows failed.', 'I returned the item last week, where is my refund?'] },
      { step: 'Verification', lines: ['Transaction ID is TXN-88210.', 'I paid via UPI, amount was ₹2,499.'] },
      { step: 'Resolution', lines: ['How long will the refund take?', 'Can you send me a confirmation message?'] },
    ],
    informationCaptured: ['Transaction ID', 'Payment Method', 'Amount', 'Order ID', 'Return Status'],
    edgeCases: [
      { title: 'Double Charge', example: '"I was charged twice for the same order"', frequency: '6%' },
      { title: 'Expired Refund Window', example: "\"It's been 30 days, is it too late?\"", frequency: '4%' },
    ],
    outcomes: ['Refund Initiated', 'Payment Fixed', 'Escalated', 'Pending Investigation'],
    representativeCalls: [
      { callId: 'CALL-2101', duration: '4:55', language: 'English', outcome: 'Refund Initiated' },
      { callId: 'CALL-2115', duration: '6:30', language: 'Hindi', outcome: 'Escalated' },
    ],
  },
  {
    id: 'sc-3',
    name: 'Appointment Scheduling',
    callCount: 18,
    percentage: 21,
    goal: 'Schedule or reschedule customer appointments',
    trigger: 'Customer wants to book, change, or cancel an appointment',
    patterns: [
      'Customer requests specific date/time',
      'Agent checks availability',
      'Confirmation sent via SMS',
    ],
    commonOutcome: 'Appointment Booked',
    confidence: 91,
    goalDetail: {
      business: 'Maximize booking rate and reduce no-shows',
      agentTask: 'Find suitable slot and confirm booking',
      expectedOutcome: 'Appointment confirmed with SMS confirmation',
    },
    triggerDetail: 'Customer needs a service appointment or wants to change an existing one.',
    flow: [
      { id: '1', type: 'action', label: 'Greet & ask purpose', branches: [{ label: '', targetId: '2' }] },
      { id: '2', type: 'condition', label: 'New or Reschedule?', branches: [{ label: 'New', targetId: '3' }, { label: 'Reschedule', targetId: '2a' }] },
      { id: '2a', type: 'action', label: 'Look up existing appointment', branches: [{ label: '', targetId: '3' }] },
      { id: '3', type: 'question', label: 'Preferred date & time?', branches: [{ label: '', targetId: '4' }] },
      { id: '4', type: 'condition', label: 'Slot available?', branches: [{ label: 'Yes', targetId: '5' }, { label: 'No', targetId: '4a' }] },
      { id: '4a', type: 'action', label: 'Suggest alternatives', branches: [{ label: '', targetId: '3' }] },
      { id: '5', type: 'action', label: 'Confirm & send SMS', branches: [{ label: '', targetId: '6' }] },
      { id: '6', type: 'end', label: 'End call' },
    ],
    utterances: [
      { step: 'Opening', lines: ['I need to book an appointment for next week.', 'Can I reschedule my Thursday appointment?'] },
      { step: 'Scheduling', lines: ['Tuesday 3 PM works for me.', 'Do you have anything in the morning?'] },
      { step: 'Closing', lines: ["Great, I'll be there. Thanks!", 'Please send me a reminder.'] },
    ],
    informationCaptured: ['Customer Name', 'Phone Number', 'Preferred Date', 'Preferred Time', 'Service Type', 'Location'],
    edgeCases: [
      { title: 'No slots available this week', example: "\"Everything is full? That's annoying.\"", frequency: '7%' },
      { title: 'Customer wants specific doctor/agent', example: '"I only want Dr. Sharma"', frequency: '5%' },
    ],
    outcomes: ['Appointment Booked', 'Rescheduled', 'Cancelled', 'No Suitable Slot'],
    representativeCalls: [
      { callId: 'CALL-3201', duration: '3:15', language: 'English', outcome: 'Appointment Booked' },
      { callId: 'CALL-3218', duration: '4:00', language: 'Hindi', outcome: 'Rescheduled' },
    ],
  },
  {
    id: 'sc-4',
    name: 'Technical Troubleshooting',
    callCount: 12,
    percentage: 14,
    goal: 'Help customer resolve a technical issue with their product/service',
    trigger: 'Product malfunction or service not working as expected',
    patterns: [
      'Customer describes the problem symptom',
      'Agent walks through diagnostic steps',
      'Issue resolved or ticket created',
    ],
    commonOutcome: 'Issue Resolved',
    confidence: 86,
    goalDetail: {
      business: 'Reduce technician dispatch rate through phone resolution',
      agentTask: 'Diagnose issue remotely and guide fix',
      expectedOutcome: 'Issue fixed on call or ticket created for follow-up',
    },
    triggerDetail: 'Device or service stopped working, or customer noticed abnormal behavior.',
    flow: [
      { id: '1', type: 'action', label: 'Greet & identify product', branches: [{ label: '', targetId: '2' }] },
      { id: '2', type: 'question', label: 'Describe the issue', branches: [{ label: '', targetId: '3' }] },
      { id: '3', type: 'action', label: 'Run diagnostic steps', branches: [{ label: '', targetId: '4' }] },
      { id: '4', type: 'condition', label: 'Issue resolved?', branches: [{ label: 'Yes', targetId: '5' }, { label: 'No', targetId: '4a' }] },
      { id: '4a', type: 'action', label: 'Create support ticket', branches: [{ label: '', targetId: '5' }] },
      { id: '5', type: 'end', label: 'End call' },
    ],
    utterances: [
      { step: 'Opening', lines: ['My internet has been down since morning.', 'The app keeps crashing when I open it.'] },
      { step: 'Diagnosis', lines: ['I already tried restarting.', 'The light is blinking red.'] },
      { step: 'Resolution', lines: ["Oh it's working now, thanks!", 'When will the technician come?'] },
    ],
    informationCaptured: ['Product Model', 'Account ID', 'Issue Description', 'Steps Tried', 'Error Code'],
    edgeCases: [
      { title: 'Customer not tech-savvy', example: '"I don\'t know what a router is"', frequency: '10%' },
      { title: 'Recurring issue', example: '"This is the 3rd time this month"', frequency: '6%' },
    ],
    outcomes: ['Issue Resolved', 'Ticket Created', 'Technician Dispatched', 'Escalated'],
    representativeCalls: [
      { callId: 'CALL-4101', duration: '7:20', language: 'English', outcome: 'Issue Resolved' },
      { callId: 'CALL-4115', duration: '9:45', language: 'Hindi', outcome: 'Ticket Created' },
    ],
  },
  {
    id: 'sc-5',
    name: 'Feedback & Complaint',
    callCount: 7,
    percentage: 8,
    goal: 'Collect customer feedback or handle complaints',
    trigger: 'Customer wants to share experience or file a complaint',
    patterns: [
      'Customer expresses dissatisfaction',
      'Agent acknowledges and documents',
      'Resolution offered or escalated',
    ],
    commonOutcome: 'Complaint Logged',
    confidence: 82,
    goalDetail: {
      business: 'Capture customer sentiment and prevent churn',
      agentTask: 'Listen empathetically, log complaint, offer resolution',
      expectedOutcome: 'Customer feels heard; complaint tracked in system',
    },
    triggerDetail: 'Bad experience with product, service, or prior support interaction.',
    flow: [
      { id: '1', type: 'action', label: 'Greet & listen', branches: [{ label: '', targetId: '2' }] },
      { id: '2', type: 'action', label: 'Acknowledge concern', branches: [{ label: '', targetId: '3' }] },
      { id: '3', type: 'condition', label: 'Actionable complaint?', branches: [{ label: 'Yes', targetId: '4' }, { label: 'No', targetId: '3a' }] },
      { id: '3a', type: 'action', label: 'Log feedback & thank', branches: [{ label: '', targetId: '5' }] },
      { id: '4', type: 'action', label: 'Offer resolution / compensation', branches: [{ label: '', targetId: '5' }] },
      { id: '5', type: 'end', label: 'End call' },
    ],
    utterances: [
      { step: 'Opening', lines: ['I had a terrible experience with your service.', 'I want to file a complaint about my delivery.'] },
      { step: 'Description', lines: ['The product was damaged when it arrived.', 'Your agent was very rude last time.'] },
      { step: 'Closing', lines: ['I hope this gets resolved.', 'I expect a callback from your manager.'] },
    ],
    informationCaptured: ['Customer Name', 'Complaint Category', 'Description', 'Previous Interactions', 'Desired Resolution'],
    edgeCases: [
      { title: 'Escalation Demand', example: '"I want to speak to your manager NOW"', frequency: '12%' },
      { title: 'Threatening to go public', example: "\"I'll post this on social media\"", frequency: '4%' },
    ],
    outcomes: ['Complaint Logged', 'Compensation Offered', 'Escalated to Manager', 'Feedback Recorded'],
    representativeCalls: [
      { callId: 'CALL-5001', duration: '6:10', language: 'English', outcome: 'Complaint Logged' },
      { callId: 'CALL-5012', duration: '8:30', language: 'Hindi', outcome: 'Escalated to Manager' },
    ],
  },
];
