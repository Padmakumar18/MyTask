import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { CartItem, CreateCartItem, UpdateCartItem } from '../../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartItemsService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all cart items for a category
   */
  async getItemsByCategory(categoryId: string): Promise<CartItem[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as CartItem[];
  }

  /**
   * Add a new cart item to a category
   */
  async addItem(categoryId: string, item: CreateCartItem): Promise<CartItem> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        {
          category_id: categoryId,
          product_name: item.product_name,
          price: item.price,
          product_link: item.product_link || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as CartItem;
  }

  /**
   * Update a cart item
   */
  async updateItem(itemId: string, updates: UpdateCartItem): Promise<CartItem> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.product_name !== undefined) updateData.product_name = updates.product_name;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.product_link !== undefined) updateData.product_link = updates.product_link;

    const { data, error } = await supabase
      .from('cart_items')
      .update(updateData)
      .eq('cart_item_id', itemId)
      .select()
      .single();

    if (error) throw error;

    return data as CartItem;
  }

  /**
   * Delete a cart item
   */
  async deleteItem(itemId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('cart_items').delete().eq('cart_item_id', itemId);

    if (error) throw error;
  }

  /**
   * Get total price for a category
   */
  async getCategoryTotal(categoryId: string): Promise<number> {
    const items = await this.getItemsByCategory(categoryId);
    return items.reduce((total, item) => total + Number(item.price), 0);
  }
}
