export interface Cart {
  cart_id: string;
  user_id: string;
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
