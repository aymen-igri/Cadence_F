export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const result = new Date(d.getFullYear(), d.getMonth(), diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getWeekDays(
  anchorDate: Date,
): { dayName: string; date: Date; dayOfWeek: string }[] {
  const daysString = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeekNames = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() + i);
    const dayIndex = d.getDay();
    weekDays.push({
      dayName: daysString[dayIndex],
      date: d,
      dayOfWeek: dayOfWeekNames[dayIndex],
    });
  }
  return weekDays;
}

export function getTimeSlots(): string[] {
  const slots: string[] = [];
  // 08:00 to 20:00 inclusive
  for (let i = 8; i <= 20; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function computeBlockStyles(
  startStr: string,
  endStr: string,
): { top: string; height: string } {
  const startMin = timeToMinutes(startStr);
  const endMin = timeToMinutes(endStr);
  const baseMin = timeToMinutes('08:00'); // Calendar starts at 08:00

  // 1 minute = 1 pixel
  const top = startMin - baseMin;
  const height = endMin - startMin;

  return { top: `${top}px`, height: `${height}px` };
}

export function getSubjectColor(subjectId: string): string {
  // Deterministic colors leveraging Spartan UI tailwind properties mapped safely
  const colors = [
    'bg-[var(--chart-1)]/20 text-[var(--chart-1)] border-[var(--chart-1)]/50',
    'bg-[var(--chart-2)]/20 text-[var(--chart-2)] border-[var(--chart-2)]/50',
    'bg-[var(--chart-3)]/20 text-[var(--chart-3)] border-[var(--chart-3)]/50',
    'bg-[var(--chart-4)]/20 text-[var(--chart-4)] border-[var(--chart-4)]/50',
    'bg-[var(--chart-5)]/20 text-[var(--chart-5)] border-[var(--chart-5)]/50',
    'bg-primary/20 text-primary border-primary/50',
    'bg-secondary/80 text-secondary-foreground border-secondary/50',
  ];

  if (!subjectId) return colors[0];
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) {
    hash = subjectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
