export interface Event {
  event_id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
}

export interface CreateEvent {
  title: string;
  description?: string;
  event_date: string;
}

export interface UpdateEvent {
  title?: string;
  description?: string;
  event_date?: string;
}
