export type UrgencyLevel = 'normal' | 'medium' | 'critical' | 'critical24h' | 'report';

export type TaskStatus = 'active' | 'completed' | 'overdue';

export type ViewMode = 'card' | 'list' | 'eisenhower';

export type FeedbackTopic =
  | 'Organização'
  | 'Comunicação'
  | 'Pro atividade'
  | 'Prioridades'
  | 'ICC'
  | 'KISS'
  | 'Reportar problemas';

export type FeedbackType =
  | 'precisa mais atenção'
  | 'precisa um pouco mais de atenção'
  | 'mandou bem!'
  | 'cooperação';

export interface Department {
  id: string;
  name: string;
  color: string; // HSL string for accent
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  departmentId: string;
}

export interface FeedbackAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Feedback {
  id: string;
  taskId: string;
  topic: FeedbackTopic;
  type: FeedbackType;
  comment?: string;
  anonymous: boolean;
  authorId?: string;
  createdAt: string;
  attachments?: FeedbackAttachment[];
}

export interface Task {
  id: string;
  code: string;
  title: string;
  assigneeIds: string[];
  deadline: string;
  urgency: UrgencyLevel;
  important: boolean;
  process: string;
  observations?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  feedback: Feedback[];
}

export interface UserPermissions {
  visibleDepartments: string[] | 'all';
  role: 'admin' | 'user';
}

export interface AppFilters {
  departmentId: string | null;
  process: string | null;
  urgency: UrgencyLevel | null;
  status: TaskStatus | null;
  feedbackTopic: FeedbackTopic | null;
  dateRange: { from: Date | null; to: Date | null };
}

export type SidebarMode = 'none' | 'highlight' | 'isolate';

export interface AppSettings {
  feedbackRequired: boolean;
  darkMode: boolean;
  managerDashboard: boolean;
}
