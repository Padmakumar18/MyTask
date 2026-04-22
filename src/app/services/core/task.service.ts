import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { Task, TaskStatus } from '../../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private supabaseService: SupabaseService) {}

  async getTasks(userId: string | null) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as Task[];
  }

  async addTask(userId: string | null, title: string, description: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          task_name: title,
          task_description: description,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Task;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('task_id', taskId)
      .select()
      .single();

    if (error) throw error;

    return data as Task;
  }

  async updateTask(taskId: string, title: string, description: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('tasks')
      .update({
        task_name: title,
        task_description: description,
      })
      .eq('task_id', taskId)
      .select()
      .single();

    if (error) throw error;

    return data as Task;
  }

  async deleteTask(taskId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('tasks').delete().eq('task_id', taskId).select();

    if (error) throw error;

    return data;
  }
}
