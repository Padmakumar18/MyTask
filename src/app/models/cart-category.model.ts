export interface CartCategory {
  category_id: string;
  user_id: string;
  category_name: string;
  created_at: string;
}

export interface CreateCartCategory {
  category_name: string;
}

export interface UpdateCartCategory {
  category_name: string;
}
