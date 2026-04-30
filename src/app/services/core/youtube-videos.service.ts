import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import {
  YoutubeVideo,
  CreateYoutubeVideo,
  UpdateYoutubeVideo,
  YoutubeVideoInfo,
} from '../../models/youtube-video.model';

@Injectable({
  providedIn: 'root',
})
export class YoutubeVideosService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Get video information from YouTube URL
   */
  getVideoInfo(url: string): YoutubeVideoInfo | null {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;

    return {
      videoId,
      title: 'YouTube Video', // Default title
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    };
  }

  /**
   * Get all videos for a category
   */
  async getVideosByCategory(categoryId: string): Promise<YoutubeVideo[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_links')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as YoutubeVideo[];
  }

  /**
   * Get videos by status within a category
   */
  async getVideosByStatus(
    categoryId: string,
    status: 'need_to_watch' | 'completed',
  ): Promise<YoutubeVideo[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_links')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as YoutubeVideo[];
  }

  /**
   * Add a new video to a category
   */
  async addVideo(categoryId: string, video: CreateYoutubeVideo): Promise<YoutubeVideo> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_links')
      .insert([
        {
          category_id: categoryId,
          youtube_link: video.youtube_link,
          title: video.title || 'YouTube Video',
          status: video.status || 'need_to_watch',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as YoutubeVideo;
  }

  /**
   * Update a video
   */
  async updateVideo(videoId: string, updates: UpdateYoutubeVideo): Promise<YoutubeVideo> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.youtube_link !== undefined) updateData.youtube_link = updates.youtube_link;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('youtube_links')
      .update(updateData)
      .eq('youtube_link_id', videoId)
      .select()
      .single();

    if (error) throw error;

    return data as YoutubeVideo;
  }

  /**
   * Toggle video status
   */
  async toggleStatus(videoId: string, currentStatus: string | null): Promise<YoutubeVideo> {
    const newStatus = currentStatus === 'need_to_watch' ? 'completed' : 'need_to_watch';
    return this.updateVideo(videoId, { status: newStatus });
  }

  /**
   * Delete a video
   */
  async deleteVideo(videoId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('youtube_links').delete().eq('youtube_link_id', videoId);

    if (error) throw error;
  }
}
