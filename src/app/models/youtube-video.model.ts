export type VideoStatus = 'need_to_watch' | 'completed';

export interface YoutubeVideo {
  youtube_link_id: string;
  category_id: string;
  youtube_link: string;
  title: string | null;
  status: VideoStatus | null;
  created_at: string;
}

export interface CreateYoutubeVideo {
  youtube_link: string;
  title?: string;
  status?: VideoStatus;
}

export interface UpdateYoutubeVideo {
  youtube_link?: string;
  title?: string;
  status?: VideoStatus;
}

export interface YoutubeVideoInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}
