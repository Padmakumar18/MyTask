export interface CartItem {
  cart_item_id: string;
  category_id: string;
  product_name: string;
  price: number;
  product_link: string | null;
  created_at: string;
}

export interface CreateCartItem {
  product_name: string;
  price: number;
  product_link?: string;
}

export interface UpdateCartItem {
  product_name?: string;
  price?: number;
  product_link?: string;
}
