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

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          user_id: userId,
          title: event.title,
          description: event.description || null,
          event_date: event.event_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Event;
  }

  async updateEvent(eventId: string, updates: UpdateEvent): Promise<Event> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.event_date !== undefined) updateData.event_date = updates.event_date;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('event_id', eventId)
      .select()
      .single();

    if (error) throw error;

    return data as Event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('events').delete().eq('event_id', eventId);

    if (error) throw error;
  }
}
