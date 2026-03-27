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
