import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { YoutubeVideosService } from '../../services/core/youtube-videos.service';
import { YoutubeVideo, VideoStatus } from '../../models/youtube-video.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-youtube-videos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './youtube-videos.html',
  styleUrl: './youtube-videos.css',
})
export class YoutubeVideos implements OnInit {
  private videos = signal<YoutubeVideo[]>([]);

  categoryId = signal<string>('');
  categoryName = signal<string>('');
  isAddingVideo = signal(false);
  isEditingVideo = signal(false);
  selectedVideo = signal<YoutubeVideo | null>(null);
  videoToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);
  selectedFilter = signal<'all' | 'need_to_watch' | 'completed'>('all');

  videoForm: FormGroup;

  private fb = inject(FormBuilder);
  private videosService = inject(YoutubeVideosService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

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
    if (!userId) {
      console.warn('YouTube Videos - No user found');
      toast.warning('Please log in to manage your videos');
      return;
    }

    // Get category ID from route params
    this.route.params.subscribe((params) => {
      const catId = params['categoryId'];
      if (catId) {
        this.categoryId.set(catId);
        this.loadVideos();
      }
    });

    // Get category name from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (this.location.getState() as any);
    if (state?.categoryName) {
      this.categoryName.set(state.categoryName);
    }
  }

  async loadVideos() {
    const catId = this.categoryId();
    if (!catId) return;

    this.isLoading.set(true);
    try {
      const videos = await this.videosService.getVideosByCategory(catId);
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

    const catId = this.categoryId();
    if (!catId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.videoForm.value;

      await this.videosService.addVideo(catId, {
        youtube_link: formValue.youtube_link,
        title: formValue.title?.trim() || 'YouTube Video',
        status: formValue.status,
      });

      await this.loadVideos();
      this.isAddingVideo.set(false);
      this.videoForm.reset();
      toast.success('Video added successfully!');
    } catch (error) {
      toast.error('Failed to add video');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditVideoForm(video: YoutubeVideo) {
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

      await this.videosService.updateVideo(videoId, {
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

  async toggleVideoStatus(video: YoutubeVideo) {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    try {
      await this.videosService.toggleStatus(video.youtube_link_id, video.status);
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
      await this.videosService.deleteVideo(videoId);
      await this.loadVideos();
      toast.success('Video deleted successfully!');
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
    const videoInfo = this.videosService.getVideoInfo(youtubeLink);
    return videoInfo?.thumbnailUrl || '';
  }

  getStatusLabel(status: VideoStatus | null): string {
    return (status || 'need_to_watch') === 'need_to_watch' ? 'Need to Watch' : 'Completed';
  }

  getStatusClass(status: VideoStatus | null): string {
    return (status || 'need_to_watch') === 'need_to_watch' ? 'status-pending' : 'status-completed';
  }

  goBack() {
    this.router.navigate(['/youtube-categories']);
  }
}
