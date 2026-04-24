import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { Event, CreateEvent, UpdateEvent } from '../../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private supabaseService: SupabaseService) {}

  async getEvents(userId: string): Promise<Event[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });

    if (error) throw error;

    return data as Event[];
  }

  async getEventsByDateRange(userId: string, startDate: string, endDate: string): Promise<Event[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });

    if (error) throw error;

    return data as Event[];
  }

  async getEventsByDate(userId: string, date: string): Promise<Event[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data as Event[];
  }

  async addEvent(userId: string, event: CreateEvent): Promise<Event> {
    const supabase = this.supabaseService.getClient();

    console.log(userId);

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          user_id: userId,
          event_name: event.event_name,
          description: event.description || null,
          event_date: event.event_date,
          event_time: event.event_time,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Event;
  }

  async updateEvent(eventId: string, updates: UpdateEvent): Promise<Event> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updates.event_name !== undefined) updateData.event_name = updates.event_name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.event_date !== undefined) updateData.event_date = updates.event_date;
    if (updates.event_time !== undefined) updateData.event_time = updates.event_time;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;

    return data as Event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('events').delete().eq('id', eventId);

    if (error) throw error;
  }
}
