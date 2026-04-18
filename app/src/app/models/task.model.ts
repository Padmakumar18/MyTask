export type TaskStatus = 'Pending' | 'Ongoing' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
}
