import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { YoutubeLinksService } from '../../services/core/youtube-links.service';
import { YoutubeLink, VideoStatus } from '../../models/youtube-link.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-youtube',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './youtube.html',
  styleUrl: './youtube.css',
})
export class Youtube implements OnInit {
  private videos = signal<YoutubeLink[]>([]);

  isAddingVideo = signal(false);
  isEditingVideo = signal(false);
  selectedVideo = signal<YoutubeLink | null>(null);
  videoToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);
  selectedFilter = signal<'all' | 'need_to_watch' | 'completed'>('all');

  videoForm: FormGroup;

  private fb = inject(FormBuilder);
  private youtubeService = inject(YoutubeLinksService);
  private userService = inject(UserService);

  // Computed properties
  filteredVideos = computed(() => {
    const filter = this.selectedFilter();
    const videos = this.videos();

    if (filter === 'all') return videos;
    return videos.filter((video) => (video.status || 'need_to_watch') === filter);
  });

  needToWatchCount = computed(
    () => this.videos().filter((v) => (v.status || 'need_to_watch') === 'need_to_watch').length,
  );

  completedCount = computed(() => this.videos().filter((v) => v.status === 'completed').length);

  totalCount = computed(() => this.videos().length);

  constructor() {
    this.videoForm = this.fb.group({
      youtube_link: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/),
        ],
      ],
      title: [''],
      status: ['need_to_watch', Validators.required],
    });
  }

  async ngOnInit() {
    const userId = this.userService.getUserId();
    if (userId) {
      console.log('YouTube - User ID loaded:', userId);
      await this.loadVideos();
    } else {
      console.warn('YouTube - No user found');
      toast.warning('Please log in to manage your watch later list');
    }
  }

  async loadVideos() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    try {
      const videos = await this.youtubeService.getYoutubeLinks(userId);
      this.videos.set(videos);
    } catch (error) {
      toast.error('Failed to load videos');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setFilter(filter: 'all' | 'need_to_watch' | 'completed') {
    this.selectedFilter.set(filter);
  }

  showAddVideoForm() {
    this.isAddingVideo.set(true);
    this.isEditingVideo.set(false);
    this.selectedVideo.set(null);
    this.videoForm.reset({
      youtube_link: '',
      title: '',
      status: 'need_to_watch',
    });
  }

  cancelVideoForm() {
    this.isAddingVideo.set(false);
    this.isEditingVideo.set(false);
    this.selectedVideo.set(null);
    this.videoForm.reset();
  }

  async addVideo() {
    const userId = this.userService.getUserId();

    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.videoForm.value;

      await this.youtubeService.addYoutubeLink(userId, {
        youtube_link: formValue.youtube_link,
        title: formValue.title?.trim() || 'YouTube Video',
        status: formValue.status,
      });

      await this.loadVideos();
      this.isAddingVideo.set(false);
      this.videoForm.reset();
      toast.success('Video added to watch later!');
    } catch (error) {
      toast.error('Failed to add video');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditVideoForm(video: YoutubeLink) {
    this.selectedVideo.set(video);
    this.isEditingVideo.set(true);
    this.isAddingVideo.set(true);
    this.videoForm.patchValue({
      youtube_link: video.youtube_link,
      title: video.title || '',
      status: video.status || 'need_to_watch',
    });
  }

  async updateVideo() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    const videoId = this.selectedVideo()?.youtube_link_id;
    if (!videoId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.videoForm.value;

      await this.youtubeService.updateYoutubeLink(videoId, {
        youtube_link: formValue.youtube_link,
        title: formValue.title?.trim() || 'YouTube Video',
        status: formValue.status,
      });

      await this.loadVideos();
      this.isAddingVideo.set(false);
      this.isEditingVideo.set(false);
      this.selectedVideo.set(null);
      this.videoForm.reset();
      toast.success('Video updated successfully!');
    } catch (error) {
      toast.error('Failed to update video');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleVideoStatus(video: YoutubeLink) {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    try {
      await this.youtubeService.toggleStatus(video.youtube_link_id, video.status);
      await this.loadVideos();
      const newStatus = video.status === 'need_to_watch' ? 'completed' : 'need to watch';
      toast.success(`Video marked as ${newStatus}!`);
    } catch (error) {
      toast.error('Failed to update video status');
      console.error(error);
    }
  }

  showDeleteConfirmation(videoId: string) {
    this.videoToDelete.set(videoId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.videoToDelete.set(null);
  }

  async confirmDelete() {
    const videoId = this.videoToDelete();
    if (!videoId) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.youtubeService.deleteYoutubeLink(videoId);
      await this.loadVideos();
      toast.success('Video removed from watch later!');
    } catch (error) {
      toast.error('Failed to delete video');
      console.error(error);
    } finally {
      this.isLoading.set(false);
      this.isDeleteConfirmOpen.set(false);
      this.videoToDelete.set(null);
    }
  }

  deleteVideo(videoId: string) {
    this.showDeleteConfirmation(videoId);
  }

  openYoutubeVideo(url: string) {
    window.open(url, '_blank');
  }

  getThumbnailUrl(youtubeLink: string): string {
    const videoInfo = this.youtubeService.getVideoInfo(youtubeLink);
    return videoInfo?.thumbnailUrl || '';
  }

  getStatusLabel(status: VideoStatus): string {
    return status === 'need_to_watch' ? 'Need to Watch' : 'Completed';
  }

  getStatusClass(status: VideoStatus): string {
    return status === 'need_to_watch' ? 'status-pending' : 'status-completed';
  }
}
