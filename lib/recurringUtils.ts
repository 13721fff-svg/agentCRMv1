import { RecurrenceFrequency } from '@/types';

export interface RecurringMeetingData {
  title: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  start_time: string;
  end_time: string;
  status: string;
  participants?: string[];
  client_id?: string | null;
  org_id?: string;
  created_by?: string;
  recurrence_frequency: RecurrenceFrequency;
  recurrence_end_date?: string | null;
  parent_meeting_id?: string | null;
}

export function generateRecurringInstances(
  parentMeeting: RecurringMeetingData,
  frequency: RecurrenceFrequency,
  endDate: Date
): Omit<RecurringMeetingData, 'parent_meeting_id'>[] {
  if (frequency === 'none') return [];

  const instances: Omit<RecurringMeetingData, 'parent_meeting_id'>[] = [];
  const startDate = new Date(parentMeeting.start_time);
  const meetingEndDate = new Date(parentMeeting.end_time);
  const duration = meetingEndDate.getTime() - startDate.getTime();

  let currentDate = new Date(startDate);

  const maxInstances = 100;
  let count = 0;

  while (currentDate <= endDate && count < maxInstances) {
    if (currentDate.getTime() !== startDate.getTime()) {
      const instanceStart = new Date(currentDate);
      const instanceEnd = new Date(currentDate.getTime() + duration);

      instances.push({
        ...parentMeeting,
        start_time: instanceStart.toISOString(),
        end_time: instanceEnd.toISOString(),
        recurrence_frequency: 'none',
      });
    }

    currentDate = getNextOccurrence(currentDate, frequency);
    count++;
  }

  return instances;
}

function getNextOccurrence(date: Date, frequency: RecurrenceFrequency): Date {
  const next = new Date(date);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      break;
  }

  return next;
}

export function checkMeetingConflict(
  newStart: Date,
  newEnd: Date,
  existingMeetings: Array<{ start_time: string; end_time: string; id: string; title?: string }>,
  excludeId?: string
): { hasConflict: boolean; conflictingMeeting?: { start_time: string; end_time: string; id: string; title?: string } } {
  for (const meeting of existingMeetings) {
    if (excludeId && meeting.id === excludeId) continue;

    const existingStart = new Date(meeting.start_time);
    const existingEnd = new Date(meeting.end_time);

    const startsInside = newStart >= existingStart && newStart < existingEnd;
    const endsInside = newEnd > existingStart && newEnd <= existingEnd;
    const wrapsAround = newStart <= existingStart && newEnd >= existingEnd;

    if (startsInside || endsInside || wrapsAround) {
      return { hasConflict: true, conflictingMeeting: meeting };
    }
  }

  return { hasConflict: false };
}

export function getRecurrenceLabel(frequency: RecurrenceFrequency): string {
  switch (frequency) {
    case 'daily':
      return 'Щодня';
    case 'weekly':
      return 'Щотижня';
    case 'monthly':
      return 'Щомісяця';
    case 'none':
    default:
      return 'Не повторюється';
  }
}

export function getReminderLabel(minutes: number): string {
  if (minutes === 0) return 'В час події';
  if (minutes < 60) return `За ${minutes} хв`;
  if (minutes === 60) return 'За 1 годину';
  if (minutes < 1440) return `За ${Math.floor(minutes / 60)} год`;
  return `За ${Math.floor(minutes / 1440)} днів`;
}
