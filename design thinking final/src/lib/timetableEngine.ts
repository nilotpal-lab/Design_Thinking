import { RoomScheduleSlot } from '../types/database';

export interface PeriodInfo {
  period_number: number;
  start_time: string;
  end_time: string;
  label: string;
  isBreak?: boolean;
}

export const PERIODS: PeriodInfo[] = [
  { period_number: 1, start_time: '08:45', end_time: '09:45', label: 'Period 1 (08:45 - 09:45)' },
  { period_number: 2, start_time: '09:45', end_time: '10:45', label: 'Period 2 (09:45 - 10:45)' },
  { period_number: 3, start_time: '11:00', end_time: '12:00', label: 'Period 3 (11:00 - 12:00)' },
  { period_number: 4, start_time: '12:00', end_time: '13:00', label: 'Period 4 (12:00 - 13:00)' },
  { period_number: 5, start_time: '13:00', end_time: '13:50', label: 'Period 5 (Lunch 13:00 - 13:50)' },
  { period_number: 6, start_time: '13:50', end_time: '14:50', label: 'Period 6 (13:50 - 14:50)' },
  { period_number: 7, start_time: '14:50', end_time: '15:50', label: 'Period 7 (14:50 - 15:50)' },
];

export function getCurrentPeriodAndDay(customDate?: Date): {
  dayOfWeek: number;
  dayLabel: string;
  periodNumber: number | null;
  periodLabel: string;
  isScheduleActive: boolean;
  note: string;
} {
  const now = customDate || new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLabel = dayLabels[day];

  if (day === 0) {
    return {
      dayOfWeek: 0,
      dayLabel: 'Sun',
      periodNumber: null,
      periodLabel: 'Sunday',
      isScheduleActive: false,
      note: 'No scheduled classes today (Sunday)',
    };
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // 08:45 is 525 min, 15:50 is 950 min
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Check break: 10:45 to 11:00 (645 to 660)
  if (currentMinutes >= toMin('10:45') && currentMinutes < toMin('11:00')) {
    return {
      dayOfWeek: day,
      dayLabel,
      periodNumber: 2, // Map to Period 2 break
      periodLabel: 'Morning Break (10:45 - 11:00)',
      isScheduleActive: true,
      note: 'Morning break time',
    };
  }

  for (const p of PERIODS) {
    const startMin = toMin(p.start_time);
    const endMin = toMin(p.end_time);
    if (currentMinutes >= startMin && currentMinutes < endMin) {
      return {
        dayOfWeek: day,
        dayLabel,
        periodNumber: p.period_number,
        periodLabel: p.label,
        isScheduleActive: true,
        note: `Currently active: ${p.label}`,
      };
    }
  }

  // If outside active hours (e.g. before 8:45 or after 15:50)
  const isBefore = currentMinutes < toMin('08:45');
  return {
    dayOfWeek: day,
    dayLabel,
    periodNumber: null,
    periodLabel: isBefore ? 'Before College Hours' : 'After College Hours',
    isScheduleActive: false,
    note: isBefore ? 'First period starts at 08:45 AM' : 'College schedule ended for the day at 03:50 PM',
  };
}

export function isRoomFree(
  slots: RoomScheduleSlot[],
  roomId: string,
  dayOfWeek: number,
  periodNumber: number
): boolean {
  const slot = slots.find(
    (s) => s.room_id === roomId && s.day_of_week === dayOfWeek && s.period_number === periodNumber
  );
  if (!slot) return false;
  return slot.is_scheduled_free === true;
}
