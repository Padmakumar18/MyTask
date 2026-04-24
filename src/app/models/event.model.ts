export interface Event {
  id: string;
  user_id: string;
  event_name: string;
  description: string | null;
  event_date: string;
  event_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEvent {
  event_name: string;
  description?: string;
  event_date: string;
  event_time: string;
}

export interface UpdateEvent {
  event_name?: string;
  description?: string;
  event_date?: string;
  event_time?: string;
}
