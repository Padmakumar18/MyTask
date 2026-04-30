export type VideoStatus = 'need_to_watch' | 'completed';

export interface YoutubeLink {
  youtube_link_id: string;
  user_id: string;
  youtube_link: string;
  title: string | null;
  status: VideoStatus | null;
  created_at: string;
}

export interface CreateYoutubeLink {
  youtube_link: string;
  title?: string;
  status?: VideoStatus;
}

export interface UpdateYoutubeLink {
  youtube_link?: string;
  title?: string;
  status?: VideoStatus;
}

export interface YoutubeVideoInfo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}
