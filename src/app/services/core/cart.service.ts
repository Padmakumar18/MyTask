import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { Cart, CreateCartItem, UpdateCartItem } from '../../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private supabaseService: SupabaseService) {}

  async getCartItems(userId: string): Promise<Cart[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as Cart[];
  }

  async addCartItem(userId: string, item: CreateCartItem): Promise<Cart> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('cart')
      .insert([
        {
          user_id: userId,
          product_name: item.product_name,
          price: item.price,
          product_link: item.product_link || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Cart;
  }

  async updateCartItem(cartId: string, updates: UpdateCartItem): Promise<Cart> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.product_name !== undefined) updateData.product_name = updates.product_name;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.product_link !== undefined) updateData.product_link = updates.product_link;

    const { data, error } = await supabase
      .from('cart')
      .update(updateData)
      .eq('cart_id', cartId)
      .select()
      .single();

    if (error) throw error;

    return data as Cart;
  }

  async deleteCartItem(cartId: string) {
    console.log(cartId);
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('cart').delete().eq('cart_id', cartId).select();

    if (error) throw error;
    return data;
  }

  async getTotalPrice(userId: string): Promise<number> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('cart').select('price').eq('user_id', userId);

    if (error) throw error;

    return data.reduce((total, item) => total + Number(item.price), 0);
  }
}
