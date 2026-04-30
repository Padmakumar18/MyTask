export interface YoutubeCategory {
  category_id: string;
  user_id: string;
  category_name: string;
  created_at: string;
}

export interface CreateYoutubeCategory {
  category_name: string;
}

export interface UpdateYoutubeCategory {
  category_name: string;
}
