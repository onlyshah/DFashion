import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  isActive: boolean;
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

@Component({
  selector: 'app-view-add-stories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-add-stories.component.html',
  styleUrls: ['./view-add-stories.component.scss']
})
export class ViewAddStoriesComponent implements OnInit, OnDestroy {
  @ViewChild('storiesContainer', { static: false }) storiesContainer!: ElementRef;
  @ViewChild('feedCover', { static: false }) feedCover!: ElementRef;
  currentUser: any = null;

  stories: Story[] = [];
  isLoadingStories = true;

  currentIndex = 0;
  isOpen = false;
  isRotating = false;
  isDragging = false;
  rotateY = 0;
  targetRotateY = 0;
  targetDirection: 'forward' | 'back' | null = null;
  dragStartX = 0;
  dragCurrentX = 0;
  minDragPercentToTransition = 0.5;
  minVelocityToTransition = 0.65;
  transitionSpeed = 6;
  private subscriptions: Subscription[] = [];

  // For slider arrows
  @ViewChild('storiesSlider', { static: false }) storiesSlider!: ElementRef<HTMLDivElement>;
  canScrollStoriesLeft = false;
  canScrollStoriesRight = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStories();
    this.setupEventListeners();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.removeEventListeners();
  }

  // --- Slider Arrow Logic ---
  scrollStoriesLeft() {
    if (this.storiesSlider) {
      this.storiesSlider.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => this.updateStoriesArrows(), 300);
    }
  }
  scrollStoriesRight() {
    if (this.storiesSlider) {
      this.storiesSlider.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => this.updateStoriesArrows(), 300);
    }
  }
  updateStoriesArrows() {
    if (this.storiesSlider) {
      const el = this.storiesSlider.nativeElement;
      this.canScrollStoriesLeft = el.scrollLeft > 0;
      this.canScrollStoriesRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
    }
  }
  ngAfterViewInit() {
    setTimeout(() => this.updateStoriesArrows(), 500);
  }

  // --- Story Logic (unchanged) ---
  loadStories() {
    this.isLoadingStories = true;
    this.subscriptions.push(
      this.http.get<any>(`${environment.apiUrl}/stories`).subscribe({
        next: (response) => {
          if (response.success && response.storyGroups) {
            this.stories = response.storyGroups;
          } else {
            this.loadFallbackStories();
          }
          this.isLoadingStories = false;
        },
        error: (error) => {
          console.error('Error loading stories:', error);
          this.loadFallbackStories();
          this.isLoadingStories = false;
        }
      })
    );
  }

  loadFallbackStories() {
    this.stories = [
      // ... (same as before, omitted for brevity)
    ];
  }

  openStories(index: number = 0) {
    this.currentIndex = index;
    this.isOpen = true;
    this.showStory(index);
    document.body.style.overflow = 'hidden';
  }
  closeStories() {
    this.isOpen = false;
    this.pauseAllVideos();
    document.body.style.overflow = 'auto';
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.classList.add('is-closed');
    }
    setTimeout(() => {
      if (this.storiesContainer) {
        this.storiesContainer.nativeElement.classList.remove('is-closed');
      }
    }, 300);
  }
  showStory(index: number) {
    this.currentIndex = index;
    this.rotateY = 0;
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 'translateZ(-50vw)';
    }
  }
  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.targetRotateY = -90;
      this.targetDirection = 'forward';
      this.isRotating = true;
      this.update();
    } else {
      this.closeStories();
    }
  }
  previousStory() {
    if (this.currentIndex > 0) {
      this.targetRotateY = 90;
      this.targetDirection = 'back';
      this.isRotating = true;
      this.update();
    } else {
      this.closeStories();
    }
  }
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen) return;
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStories();
        break;
    }
  }
  onStoryClick(event: MouseEvent) {
    if (this.isRotating) return;
    const clickX = event.clientX;
    const windowWidth = window.innerWidth;
    if (clickX < windowWidth / 3) {
      this.previousStory();
    } else {
      this.nextStory();
    }
  }
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.dragStartX = event.touches[0].clientX;
    this.dragCurrentX = this.dragStartX;
  }
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    this.dragCurrentX = event.touches[0].clientX;
    this.updateDragPosition();
  }
  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const dragDelta = this.dragCurrentX - this.dragStartX;
    const threshold = window.innerWidth * this.minDragPercentToTransition;
    if (Math.abs(dragDelta) > threshold) {
      if (dragDelta > 0) {
        this.previousStory();
      } else {
        this.nextStory();
      }
    } else {
      this.targetRotateY = 0;
      this.isRotating = true;
      this.update();
    }
  }
  private updateDragPosition() {
    const dragDelta = this.dragCurrentX - this.dragStartX;
    this.rotateY = (dragDelta / window.innerWidth) * 90;
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 
        `translateZ(-50vw) rotateY(${this.rotateY}deg)`;
    }
  }
  private update() {
    if (!this.isRotating) return;
    this.rotateY += (this.targetRotateY - this.rotateY) / this.transitionSpeed;
    if (Math.abs(this.rotateY - this.targetRotateY) < 0.5) {
      this.rotateY = this.targetRotateY;
      this.isRotating = false;
      if (this.targetDirection) {
        const newIndex = this.targetDirection === 'forward' 
          ? this.currentIndex + 1 
          : this.currentIndex - 1;
        this.showStory(newIndex);
        this.targetDirection = null;
      }
      return;
    }
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 
        `translateZ(-50vw) rotateY(${this.rotateY}deg)`;
    }
    requestAnimationFrame(() => this.update());
  }
  private pauseAllVideos() {
    const videos = document.querySelectorAll('.story__video');
    videos.forEach((video: any) => {
      if (video.pause) {
        video.pause();
      }
    });
  }
  private setupEventListeners() {}
  private removeEventListeners() {}
  getCurrentStory(): Story {
    return this.stories[this.currentIndex];
  }
  getStoryProgress(): number {
    return ((this.currentIndex + 1) / this.stories.length) * 100;
  }
  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }
  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }
  hasProducts(): boolean {
    const story = this.getCurrentStory();
    return !!(story && story.products && story.products.length > 0);
  }
  getStoryProducts(): any[] {
    const story = this.getCurrentStory();
    return story?.products || [];
  }
  // Handler for Add Story button
  // Modal state
  showAddModal = false;
  showAddStoryModal = false;
  showAddReelModal = false;
  showPermissionModal = false;
  showCameraOrGallery = false;
  permissionDenied = false;
  // Reel recording state
  isRecording = false;
  recordedChunks: Blob[] = [];
  mediaRecorder: any = null;
  videoStream: MediaStream | null = null;
  reelPreviewUrl: string | null = null;
  isUploadingReel = false;
  newReelCaption = '';
  newStoryFile: File | null = null;
  newStoryCaption = '';
  isUploadingStory = false;
  onAdd() {
    this.showAddModal = true;
    this.showAddStoryModal = false;
    this.showAddReelModal = false;
    this.showPermissionModal = false;
    this.showCameraOrGallery = false;
    this.permissionDenied = false;
    this.newStoryFile = null;
    this.newStoryCaption = '';
    this.reelPreviewUrl = null;
    this.newReelCaption = '';
  }
  onAddStory() {
    this.showAddModal = false;
    this.showPermissionModal = true;
    this.permissionDenied = false;
    this.showAddStoryModal = false;
    this.showCameraOrGallery = false;
    this.newStoryFile = null;
    this.newStoryCaption = '';
  }
  onAddReel() {
    this.showAddModal = false;
    this.showAddReelModal = true;
    this.reelPreviewUrl = null;
    this.newReelCaption = '';
    setTimeout(() => this.startCameraForReel(), 100);
  }
  async startCameraForReel() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const video: any = document.getElementById('reel-video');
      if (video) {
        video.srcObject = this.videoStream;
        video.play();
      }
    } catch (err) {
      alert('Could not access camera.');
      this.showAddReelModal = false;
    }
  }
  startRecording() {
    if (!this.videoStream) return;
    this.recordedChunks = [];
    this.mediaRecorder = new (window as any).MediaRecorder(this.videoStream);
    this.mediaRecorder.ondataavailable = (e: any) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.reelPreviewUrl = URL.createObjectURL(blob);
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }
  async submitNewReel() {
    if (!this.reelPreviewUrl) return;
    this.isUploadingReel = true;
    try {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('media', blob, 'reel.webm');
      const uploadRes: any = await this.http.post('/api/stories/upload', formData).toPromise();
      const reelPayload = {
        media: {
          type: uploadRes.type,
          url: uploadRes.url
        },
        caption: this.newReelCaption,
        isReel: true
      };
      await this.http.post('/api/stories', reelPayload).toPromise();
      this.showAddReelModal = false;
      this.loadStories();
    } catch (err) {
      alert('Failed to upload reel.');
    } finally {
      this.isUploadingReel = false;
      this.cleanupReelStream();
    }
  }
  cleanupReelStream() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.mediaRecorder = null;
    this.isRecording = false;
    this.reelPreviewUrl = null;
  }
  closeAddReelModal() {
    this.showAddReelModal = false;
    this.cleanupReelStream();
  }
  handlePermissionResponse(allow: boolean) {
    this.showPermissionModal = false;
    if (allow) {
      this.showCameraOrGallery = true;
    } else {
      this.permissionDenied = true;
    }
  }
  openCamera() {
    this.showCameraOrGallery = false;
    this.showAddStoryModal = true;
    setTimeout(() => {
      const input: any = document.getElementById('story-file-input');
      if (input) {
        input.setAttribute('capture', 'environment');
        input.click();
      }
    }, 100);
  }
  openGallery() {
    this.showCameraOrGallery = false;
    this.showAddStoryModal = true;
    setTimeout(() => {
      const input: any = document.getElementById('story-file-input');
      if (input) {
        input.removeAttribute('capture');
        input.click();
      }
    }, 100);
  }
  onStoryFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newStoryFile = file;
    }
  }
  async submitNewStory() {
    if (!this.newStoryFile) return;
    this.isUploadingStory = true;
    try {
      const uploadForm = new FormData();
      uploadForm.append('media', this.newStoryFile);
      const uploadRes: any = await this.http.post('/api/stories/upload', uploadForm).toPromise();
      const storyPayload = {
        media: {
          type: uploadRes.type,
          url: uploadRes.url
        },
        caption: this.newStoryCaption
      };
      await this.http.post('/api/stories', storyPayload).toPromise();
      this.showAddStoryModal = false;
      this.loadStories();
    } catch (err) {
      alert('Failed to upload story.');
    } finally {
      this.isUploadingStory = false;
    }
  }
  closeAddStoryModal() {
    this.showAddStoryModal = false;
  }
}
