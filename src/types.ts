export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type SlaStatus = 'On Track' | 'At Risk' | 'Breached';
export type WorkStatus = 'Open' | 'In Progress' | 'Pending' | 'Escalated' | 'On Hold' | 'Complete';
export type WorkType =
  | 'CAN Life Licensing'
  | 'US TFA Registration'
  | 'US TFA Renewal';

export type Channel = 'Digital' | 'Agent' | 'Call Center' | 'Mail';

export interface WorkItem {
  id: string;
  type: WorkType;
  priority: Priority;
  status: WorkStatus;
  slaStatus: SlaStatus;
  policyNumber: string;
  customerName: string;
  currentStep: string;
  stepIndex: number;
  totalSteps: number;
  steps: string[];
  assignedTo: string;
  team: string;
  createdAt: string;          // ISO string
  dueBy: string;              // ISO string
  slaHoursRemaining: number;
  timeInStepHours: number;
  description: string;
  channel: Channel;
  notes: HistoryEntry[];
  documents: DocumentItem[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
}

export interface TeamMetric {
  team: string;
  open: number;
  atRisk: number;
  breached: number;
  avgCycleHrs: number;
  slaCompliance: number;
}

export interface StepMetric {
  step: string;
  avgHours: number;
  volume: number;
  bottleneck: boolean;
}

// ─── CRM Types ────────────────────────────────────────────────────────────────

export type EnquiryType = 'General' | 'Policyholder' | 'Policy' | 'Claim';
export type FollowUpStatus = 'Created' | 'In Progress' | 'Completed' | 'Withdrawn';
export type InteractionSource = 'CSU' | 'Non-CSU' | 'Customer Portal';

export interface CrmPolicy {
  policyNo: string;
  type: string;
  status: 'Active' | 'Expired' | 'Lapsed';
  plan: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface CrmClaim {
  claimNo: string;
  type: string;
  status: string;
  dateSubmitted: string;
  policyNo: string;
}

export interface CrmPayment {
  id: string;
  date: string;
  amount: number;
  type: string;
  status: 'Paid' | 'Pending' | 'Failed';
  reference: string;
}

export interface CrmCustomer {
  clientNo: string;
  fullName: string;
  nric: string;
  email: string;
  phone: string;
  portalPassword: string;
  address: string;
  dob: string;
  policies: CrmPolicy[];
  claims: CrmClaim[];
  paymentHistory: CrmPayment[];
}

export interface CrmInteraction {
  id: string;
  clientNo: string;
  clientName: string;
  enquiryType: EnquiryType;
  customerType: 'Individual' | 'Corporate';
  submissionRef: string | null;
  callerName: string;
  nric: string;
  phone: string;
  policyNo: string | null;
  claimNo: string | null;
  description: string;
  status: 'Open' | 'Completed';
  source: InteractionSource;
  createdBy: string;
  createdAt: string;
  followUps: string[];
}

export interface CrmDiscussionNote {
  timestamp: string;
  author: string;
  note: string;
}

export interface CrmFollowUp {
  id: string;
  interactionId: string;
  employeeResponsible: string;
  department: 'CSU' | 'PPD' | 'AH';
  claimedBy: string | null;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  discussion: CrmDiscussionNote[];
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CrmSmsRecord {
  id: string;
  interactionId: string;
  clientNo: string;
  clientName: string;
  phone: string;
  message: string;
  sentAt: string;
  sentBy: string;
  deliveryStatus: 'Delivered' | 'Pending' | 'Failed';
}

export interface CrmEmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
  relatedEntity: string;
  relatedId: string;
  status: 'Sent' | 'Pending' | 'Failed';
}

export interface CrmAuditEntry {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}
