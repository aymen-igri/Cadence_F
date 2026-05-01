export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface GoalProgressInfo {
  id: string;
  goalTitle: string;
  subjectName: string;
  hoursPlannedCurrentWeek: number;
  targetHoursPerWeek: number;
}
