import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import {
  YoutubeLink,
  CreateYoutubeLink,
  UpdateYoutubeLink,
  YoutubeVideoInfo,
} from '../../models/youtube-link.model';

@Injectable({
  providedIn: 'root',
})
export class YoutubeLinksService {
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
   * Get all YouTube links for a user
   */
  async getYoutubeLinks(userId: string): Promise<YoutubeLink[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as YoutubeLink[];
  }

  /**
   * Get YouTube links by status
   */
  async getYoutubeLinksByStatus(
    userId: string,
    status: 'need_to_watch' | 'completed',
  ): Promise<YoutubeLink[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_links')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as YoutubeLink[];
  }

  /**
   * Add a new YouTube link
   */
  async addYoutubeLink(userId: string, link: CreateYoutubeLink): Promise<YoutubeLink> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('youtube_links')
      .insert([
        {
          user_id: userId,
          youtube_link: link.youtube_link,
          title: link.title || 'YouTube Video',
          status: link.status || 'need_to_watch',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as YoutubeLink;
  }

  /**
   * Update a YouTube link
   */
  async updateYoutubeLink(linkId: string, updates: UpdateYoutubeLink): Promise<YoutubeLink> {
    const supabase = this.supabaseService.getClient();

    const updateData: any = {};
    if (updates.youtube_link !== undefined) updateData.youtube_link = updates.youtube_link;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('youtube_links')
      .update(updateData)
      .eq('youtube_link_id', linkId)
      .select()
      .single();

    if (error) throw error;

    return data as YoutubeLink;
  }

  /**
   * Toggle video status
   */
  async toggleStatus(linkId: string, currentStatus: string | null): Promise<YoutubeLink> {
    const newStatus = currentStatus === 'need_to_watch' ? 'completed' : 'need_to_watch';
    return this.updateYoutubeLink(linkId, { status: newStatus });
  }

  /**
   * Delete a YouTube link
   */
  async deleteYoutubeLink(linkId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('youtube_links').delete().eq('youtube_link_id', linkId);

    if (error) throw error;
  }
}
