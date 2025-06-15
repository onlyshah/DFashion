import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MediaService } from '../../../../core/services/media.service';

import { StoryService } from '../../../../core/services/story.service';
import { AuthService } from '../../../../core/services/auth.service';
import { StoryGroup, Story } from '../../../../core/models/story.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss']


})
export class StoriesComponent implements OnInit, AfterViewInit {
  @ViewChild('storiesSlider') storiesSlider!: ElementRef<HTMLDivElement>;

  storyGroups: StoryGroup[] = [];
  currentUser: User | null = null;

  // Slider properties
  translateX = 0;
  currentSlide = 0;
  isTransitioning = false;

  // Navigation properties
  canSlideLeft = false;
  canSlideRight = false;
  showArrows = false;
  showDots = false;
  dots: number[] = [];

  // Touch properties
  touchStartX = 0;
  touchCurrentX = 0;
  isDragging = false;

  // Responsive properties
  slidesPerView = 1;
  slideWidth = 0;

  constructor(
    private storyService: StoryService,
    private authService: AuthService,
    private router: Router,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadStories();
  }

  ngAfterViewInit() {
    // Initialize slider after view init
    setTimeout(() => {
      this.calculateResponsiveSettings();
      this.updateSliderState();
    }, 100);

    // Add resize listener for responsive updates
    window.addEventListener('resize', () => {
      this.calculateResponsiveSettings();
      this.updateSliderState();
    });
  }

  calculateResponsiveSettings() {
    if (!this.storiesSlider) return;

    const containerWidth = this.storiesSlider.nativeElement.clientWidth;
    const screenWidth = window.innerWidth;

    // Calculate slides per view based on screen size
    if (screenWidth >= 1024) {
      this.slidesPerView = Math.floor(containerWidth / 90); // Desktop: 90px per slide
      this.slideWidth = 90;
      this.showArrows = true;
      this.showDots = false;
    } else if (screenWidth >= 768) {
      this.slidesPerView = Math.floor(containerWidth / 80); // Tablet: 80px per slide
      this.slideWidth = 80;
      this.showArrows = true;
      this.showDots = false;
    } else if (screenWidth >= 481) {
      this.slidesPerView = Math.floor(containerWidth / 70); // Mobile landscape: 70px per slide
      this.slideWidth = 70;
      this.showArrows = false;
      this.showDots = true;
    } else if (screenWidth >= 361) {
      this.slidesPerView = Math.floor(containerWidth / 65); // Mobile portrait: 65px per slide
      this.slideWidth = 65;
      this.showArrows = false;
      this.showDots = true;
    } else {
      this.slidesPerView = Math.floor(containerWidth / 60); // Very small: 60px per slide
      this.slideWidth = 60;
      this.showArrows = false;
      this.showDots = true;
    }

    // Ensure minimum slides per view
    this.slidesPerView = Math.max(this.slidesPerView, 3);

    // Calculate dots for mobile
    if (this.showDots) {
      const totalSlides = this.storyGroups.length + 1; // +1 for "Add Story"
      const totalPages = Math.ceil(totalSlides / this.slidesPerView);
      this.dots = Array(totalPages).fill(0).map((_, i) => i);
    }
  }

  loadStories() {
    this.storyService.getStories().subscribe({
      next: (response) => {
        this.storyGroups = response.storyGroups;
        // Update slider after stories load
        setTimeout(() => {
          this.calculateResponsiveSettings();
          this.updateSliderState();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading stories:', error);
        this.storyGroups = [];
      }
    });
  }

  // Slider navigation methods
  slideLeft() {
    if (this.canSlideLeft) {
      this.currentSlide = Math.max(0, this.currentSlide - 1);
      this.updateSliderPosition();
    }
  }

  slideRight() {
    if (this.canSlideRight) {
      const maxSlide = this.getMaxSlide();
      this.currentSlide = Math.min(maxSlide, this.currentSlide + 1);
      this.updateSliderPosition();
    }
  }

  goToSlide(slideIndex: number) {
    this.currentSlide = slideIndex;
    this.updateSliderPosition();
  }

  updateSliderPosition() {
    this.isTransitioning = true;
    this.translateX = -this.currentSlide * this.slideWidth * this.slidesPerView;
    this.updateSliderState();

    // Reset transition flag after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  updateSliderState() {
    const maxSlide = this.getMaxSlide();
    this.canSlideLeft = this.currentSlide > 0;
    this.canSlideRight = this.currentSlide < maxSlide;
  }

  getMaxSlide(): number {
    const totalSlides = this.storyGroups.length + 1; // +1 for "Add Story"
    return Math.max(0, Math.ceil(totalSlides / this.slidesPerView) - 1);
  }

  onScroll() {
    // Handle manual scroll if needed
    this.updateSliderState();
  }

  // Touch gesture methods
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    this.touchCurrentX = event.touches[0].clientX;
    const deltaX = this.touchCurrentX - this.touchStartX;

    // Prevent default scrolling
    if (Math.abs(deltaX) > 10) {
      event.preventDefault();
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;

    const deltaX = this.touchCurrentX - this.touchStartX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous slide
        this.slideLeft();
      } else {
        // Swipe left - go to next slide
        this.slideRight();
      }
    }

    this.isDragging = false;
  }

  // Image handling methods
  getSafeImageUrl(url: string | undefined): string {
    return this.mediaService.getSafeImageUrl(url, 'user');
  }

  onImageError(event: Event): void {
    this.mediaService.handleImageError(event, 'user');
  }



  openAddStory() {
    this.showStoryCreationModal();
  }

  private showStoryCreationModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'story-creation-modal';
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create Story</h3>
          <button class="close-btn" onclick="this.closest('.story-creation-modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="creation-options">
            <div class="option-card camera-option" onclick="document.getElementById('camera-input').click()">
              <div class="option-icon camera-icon">
                <i class="fas fa-camera"></i>
              </div>
              <h4>Camera</h4>
              <p>Take a photo or video</p>
            </div>
            <div class="option-card gallery-option" onclick="document.getElementById('gallery-input').click()">
              <div class="option-icon gallery-icon">
                <i class="fas fa-images"></i>
              </div>
              <h4>Gallery</h4>
              <p>Choose from your photos</p>
            </div>
            <div class="option-card create-option" onclick="this.closest('.story-creation-modal').querySelector('.text-story-creator').style.display='block'">
              <div class="option-icon create-icon">
                <i class="fas fa-font"></i>
              </div>
              <h4>Create</h4>
              <p>Design with text and colors</p>
            </div>
            <div class="option-card live-option" onclick="alert('Live feature coming soon!')">
              <div class="option-icon live-icon">
                <i class="fas fa-video"></i>
              </div>
              <h4>Live</h4>
              <p>Go live with your audience</p>
            </div>
          </div>

          <!-- Text Story Creator -->
          <div class="text-story-creator" style="display: none;">
            <div class="text-editor">
              <textarea placeholder="What's on your mind?" maxlength="500"></textarea>
              <div class="color-picker">
                <div class="color-option" style="background: linear-gradient(45deg, #ff6b6b, #feca57)" onclick="this.closest('.text-story-creator').style.background='linear-gradient(45deg, #ff6b6b, #feca57)'"></div>
                <div class="color-option" style="background: linear-gradient(45deg, #48dbfb, #0abde3)" onclick="this.closest('.text-story-creator').style.background='linear-gradient(45deg, #48dbfb, #0abde3)'"></div>
                <div class="color-option" style="background: linear-gradient(45deg, #ff9ff3, #f368e0)" onclick="this.closest('.text-story-creator').style.background='linear-gradient(45deg, #ff9ff3, #f368e0)'"></div>
                <div class="color-option" style="background: linear-gradient(45deg, #54a0ff, #2e86de)" onclick="this.closest('.text-story-creator').style.background='linear-gradient(45deg, #54a0ff, #2e86de)'"></div>
              </div>
              <button class="create-text-story-btn" onclick="alert('Text story created! (Demo)')">Create Story</button>
            </div>
          </div>
        </div>

        <!-- Hidden file inputs -->
        <input type="file" id="camera-input" accept="image/*,video/*" capture="environment" style="display: none;" onchange="handleFileSelect(this)">
        <input type="file" id="gallery-input" accept="image/*,video/*" multiple style="display: none;" onchange="handleFileSelect(this)">
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .story-creation-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }

      .modal-content {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #eee;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background 0.2s;
      }

      .close-btn:hover {
        background: #f0f0f0;
      }

      .creation-options {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1.5rem;
      }

      .option-card {
        display: flex;
        align-items: center;
        padding: 1.5rem;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: relative;
        overflow: hidden;
      }

      .option-card:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }

      .camera-option {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      }

      .gallery-option {
        background: linear-gradient(135deg, #4834d4 0%, #686de0 100%);
      }

      .create-option {
        background: linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%);
      }

      .live-option {
        background: linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%);
      }

      .option-icon {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .option-icon i {
        color: white;
        font-size: 1.5rem;
      }

      .option-card h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: white;
      }

      .option-card p {
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.875rem;
      }

      .text-story-creator {
        padding: 1.5rem;
        background: linear-gradient(45deg, #ff6b6b, #feca57);
        border-radius: 12px;
        margin: 1rem;
      }

      .text-editor textarea {
        width: 100%;
        min-height: 120px;
        border: none;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        padding: 1rem;
        font-size: 1.125rem;
        resize: none;
        margin-bottom: 1rem;
      }

      .color-picker {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .color-option {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid white;
        transition: transform 0.2s;
      }

      .color-option:hover {
        transform: scale(1.1);
      }

      .create-text-story-btn {
        background: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .create-text-story-btn:hover {
        transform: scale(1.05);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(modalOverlay);

    // Add global function for file handling
    (window as any).handleFileSelect = (input: HTMLInputElement) => {
      const files = input.files;
      if (files && files.length > 0) {
        const file = files[0];
        console.log('Selected file:', file.name, file.type);

        // Create preview modal
        this.showFilePreview(file);
        modalOverlay.remove();
      }
    };
  }

  private showFilePreview(file: File) {
    const previewModal = document.createElement('div');
    previewModal.className = 'story-preview-modal';

    const fileURL = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    previewModal.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <button class="back-btn" onclick="this.closest('.story-preview-modal').remove()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h3>Create Story</h3>
          <button class="share-btn" onclick="alert('Story shared! (Demo)')">Share</button>
        </div>
        <div class="preview-media">
          ${isVideo ?
            `<video src="${fileURL}" controls autoplay muted></video>` :
            `<img src="${fileURL}" alt="Story preview">`
          }
          <div class="story-tools">
            <button class="tool-btn" onclick="alert('Add text feature coming soon!')">
              <i class="fas fa-font"></i>
            </button>
            <button class="tool-btn" onclick="alert('Add stickers feature coming soon!')">
              <i class="fas fa-smile"></i>
            </button>
            <button class="tool-btn" onclick="alert('Tag products feature coming soon!')">
              <i class="fas fa-tag"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add preview styles
    const previewStyles = document.createElement('style');
    previewStyles.textContent = `
      .story-preview-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: black;
        z-index: 10001;
        display: flex;
        flex-direction: column;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.5);
        color: white;
      }

      .back-btn, .share-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem;
      }

      .share-btn {
        background: #007bff;
        border-radius: 20px;
        padding: 0.5rem 1rem;
      }

      .preview-media {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .preview-media img,
      .preview-media video {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .story-tools {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .tool-btn {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        backdrop-filter: blur(10px);
        transition: background 0.2s;
      }

      .tool-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    `;

    document.head.appendChild(previewStyles);
    document.body.appendChild(previewModal);
  }

  openStoryViewer(storyGroup: StoryGroup) {
    if (storyGroup.stories.length > 0) {
      // Navigate to story viewer with user ID and start from first story
      this.router.navigate(['/story', storyGroup.user._id, 0]);
    } else {
      console.log('No stories available for:', storyGroup.user.username);
    }
  }
}
