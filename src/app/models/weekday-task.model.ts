export interface WeekdayTask {
  task_id: string;
  user_id: string;
  weekday_id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface CreateWeekdayTask {
  weekday_id: number;
  title: string;
  description?: string;
}

export interface UpdateWeekdayTask {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

export interface WeekdayTaskGroup {
  weekday_id: number;
  day_name: string;
  tasks: WeekdayTask[];
}
