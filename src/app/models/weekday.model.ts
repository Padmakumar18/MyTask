export interface Weekday {
  weekday_id: number;
  day_name: string;
}

export type WeekdayId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAYS: Weekday[] = [
  { weekday_id: 1, day_name: 'Monday' },
  { weekday_id: 2, day_name: 'Tuesday' },
  { weekday_id: 3, day_name: 'Wednesday' },
  { weekday_id: 4, day_name: 'Thursday' },
  { weekday_id: 5, day_name: 'Friday' },
  { weekday_id: 6, day_name: 'Saturday' },
  { weekday_id: 7, day_name: 'Sunday' },
];

export const WEEK_DAYS = WEEKDAYS.slice(0, 5); // Monday to Friday
export const WEEKEND_DAYS = WEEKDAYS.slice(5, 7); // Saturday and Sunday
