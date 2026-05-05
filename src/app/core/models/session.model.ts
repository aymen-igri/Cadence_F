export interface AppSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm

  // Relations
  subjectId?: string;
  subjectName?: string;
  goalId?: string;
  goalName?: string;
  taskId?: string;
  taskName?: string;

  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  type: 'FOCUS' | 'REVIEW' | 'PRACTICE' | 'BREAK' | 'MANUAL' | 'GENERATED';
}

export interface CreateWeeklySessionResponse {
  id: string;
  title: string;
  startTime: string;
  sessionStatus: 'PENDING' | 'COMPLETED' | 'INCOMPLETED' | 'CLOSED';
}

export interface CreateSubSessionResponse {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'COMPLETED' | 'INCOMPLETED' | 'CLOSED';
  subjectId: string;
  subjectName: string;
}
export interface CreateWeeklySessionRequest {
  title: string;
  startTime: string;
}
export interface CreateSubSessionRequest {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  subjectId: string;
}
export interface CreateSessionRequest {
  weeklySession: CreateWeeklySessionRequest;
  subSessions: CreateSubSessionRequest[];
}

export interface CreateSessionResponse {
  weeklySession: CreateWeeklySessionResponse;
  subSessions: CreateSubSessionResponse[];
}

export type UpdateSessionRequest = Partial<CreateSessionRequest>;

export interface SubjectGoalPair {
  subjectId: string;
  selectedGoalIds: string[];
}

export interface GenerateSessionModel {
  title: string;
  weekStartDate: string; // YYYY-MM-DD
  availabilityPlanID: string;
  usePriority: boolean;
  subjectGoalPairs: SubjectGoalPair[];
}

export interface GenerateSessionRequest {
  title: string;
  weekStartDate: string; // YYYY-MM-DD
  availabilityPlanID: string;
  usePriority: boolean;
  goalsList: string[];
}