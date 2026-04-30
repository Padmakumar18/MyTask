import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import {
  CartCategory,
  CreateCartCategory,
  UpdateCartCategory,
} from '../../models/cart-category.model';

@Injectable({
  providedIn: 'root',
})
export class CartCategoriesService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all cart categories for a user
   */
  async getCategories(userId: string): Promise<CartCategory[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as CartCategory[];
  }

  /**
   * Get a single cart category by ID
   */
  async getCategory(categoryId: string): Promise<CartCategory> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();

    if (error) throw error;

    return data as CartCategory;
  }

  /**
   * Create a new cart category
   */
  async createCategory(userId: string, category: CreateCartCategory): Promise<CartCategory> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_categories')
      .insert([
        {
          user_id: userId,
          category_name: category.category_name,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as CartCategory;
  }

  /**
   * Update a cart category
   */
  async updateCategory(categoryId: string, updates: UpdateCartCategory): Promise<CartCategory> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_categories')
      .update({ category_name: updates.category_name })
      .eq('category_id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return data as CartCategory;
  }

  /**
   * Delete a cart category (will cascade delete all items in the category)
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('cart_categories').delete().eq('category_id', categoryId);

    if (error) throw error;
  }
}
