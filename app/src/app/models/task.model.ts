export type TaskStatus = 'pending' | 'ongoing' | 'completed';

export interface Task {
  task_id: string;
  user_id: string;
  task_name: string;
  task_description: string;
  status: TaskStatus;
  created_at: string;
}
