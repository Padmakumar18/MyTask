import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { WeekdayTask, CreateWeekdayTask, UpdateWeekdayTask } from '../../models/weekday-task.model';

@Injectable({
  providedIn: 'root',
})
export class WeekdayTaskService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllTasks(userId: string): Promise<WeekdayTask[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('weekdaytask')
      .select('*')
      .eq('user_id', userId)
      .order('weekday_id', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data as WeekdayTask[];
  }

  async getTasksByWeekday(userId: string, weekdayId: number): Promise<WeekdayTask[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('weekdaytask')
      .select('*')
      .eq('user_id', userId)
      .eq('weekday_id', weekdayId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data as WeekdayTask[];
  }

  async getTasksByWeekdayRange(
    userId: string,
    startWeekdayId: number,
    endWeekdayId: number,
  ): Promise<WeekdayTask[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('weekdaytask')
      .select('*')
      .eq('user_id', userId)
      .gte('weekday_id', startWeekdayId)
      .lte('weekday_id', endWeekdayId)
      .order('weekday_id', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data as WeekdayTask[];
  }

  async addTask(userId: string, task: CreateWeekdayTask): Promise<WeekdayTask> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('weekdaytask')
      .insert([
        {
          user_id: userId,
          weekday_id: task.weekday_id,
          title: task.title,
          description: task.description || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as WeekdayTask;
  }

  async updateTask(taskId: string, updates: UpdateWeekdayTask): Promise<WeekdayTask> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.is_completed !== undefined) updateData.is_completed = updates.is_completed;

    const { data, error } = await supabase
      .from('weekdaytask')
      .update(updateData)
      .eq('task_id', taskId)
      .select()
      .single();

    if (error) throw error;

    return data as WeekdayTask;
  }

  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<WeekdayTask> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('weekdaytask')
      .update({ is_completed: isCompleted })
      .eq('task_id', taskId)
      .select()
      .single();

    if (error) throw error;

    return data as WeekdayTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('weekdaytask').delete().eq('task_id', taskId);

    if (error) throw error;
  }
}
