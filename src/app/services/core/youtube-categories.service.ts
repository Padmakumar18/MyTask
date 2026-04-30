import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import {
  YoutubeCategory,
  CreateYoutubeCategory,
  UpdateYoutubeCategory,
} from '../../models/youtube-category.model';

@Injectable({
  providedIn: 'root',
})
export class YoutubeCategoriesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all categories for a user
   */
  async getCategories(userId: string): Promise<YoutubeCategory[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as YoutubeCategory[];
  }

  /**
   * Get a single category by ID
   */
  async getCategory(categoryId: string): Promise<YoutubeCategory> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();

    if (error) throw error;

    return data as YoutubeCategory;
  }

  /**
   * Create a new category
   */
  async createCategory(userId: string, category: CreateYoutubeCategory): Promise<YoutubeCategory> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_categories')
      .insert([
        {
          user_id: userId,
          category_name: category.category_name,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as YoutubeCategory;
  }

  /**
   * Update a category
   */
  async updateCategory(
    categoryId: string,
    updates: UpdateYoutubeCategory,
  ): Promise<YoutubeCategory> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_categories')
      .update({ category_name: updates.category_name })
      .eq('category_id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return data as YoutubeCategory;
  }

  /**
   * Delete a category (will cascade delete all videos in the category)
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('youtube_categories')
      .delete()
      .eq('category_id', categoryId);

    if (error) throw error;
  }
}
