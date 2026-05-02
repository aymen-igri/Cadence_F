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

export function getSubjectColor(status: string): string {
  // Deterministic colors leveraging Spartan UI tailwind properties mapped safely
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'INCOMPLETED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return '';
  }
}
