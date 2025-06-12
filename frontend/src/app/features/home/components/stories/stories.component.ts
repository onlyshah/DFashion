import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StoryService } from '../../../../core/services/story.service';
import { AuthService } from '../../../../core/services/auth.service';
import { StoryGroup, Story } from '../../../../core/models/story.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stories-section">
      <div class="stories-container">
        <!-- Add Story -->
        <div class="story-item add-story" (click)="openAddStory()">
          <div class="story-avatar">
            <i class="fas fa-plus"></i>
          </div>
          <span>Your Story</span>
        </div>

        <!-- User Stories -->
        <div 
          *ngFor="let storyGroup of storyGroups" 
          class="story-item"
          (click)="openStoryViewer(storyGroup)"
        >
          <div class="story-avatar" [class.has-story]="storyGroup.stories.length > 0">
            <img [src]="storyGroup.user.avatar" [alt]="storyGroup.user.fullName">
          </div>
          <span>{{ storyGroup.user.username }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stories-section {
      margin-bottom: 24px;
    }

    .stories-container {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #fff;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .stories-container::-webkit-scrollbar {
      display: none;
    }

    .story-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .story-item:hover {
      transform: scale(1.05);
    }

    .story-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #fafafa;
      border: 1px solid #dbdbdb;
      padding: 2px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .story-avatar.has-story {
      background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    }

    .story-avatar img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fff;
    }

    .add-story .story-avatar {
      background: #fafafa;
      border: 1px solid #dbdbdb;
    }

    .add-story .story-avatar i {
      color: var(--primary-color);
      font-size: 20px;
    }

    .story-item span {
      font-size: 12px;
      color: #262626;
      text-align: center;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .stories-container {
        padding: 12px;
        gap: 12px;
      }

      .story-avatar {
        width: 56px;
        height: 56px;
      }

      .story-avatar img {
        width: 52px;
        height: 52px;
      }

      .story-item {
        min-width: 70px;
      }
    }
  `]
})
export class StoriesComponent implements OnInit {
  storyGroups: StoryGroup[] = [];
  currentUser: User | null = null;

  constructor(
    private storyService: StoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadStories();
  }

  loadStories() {
    this.storyService.getStories().subscribe({
      next: (response) => {
        this.storyGroups = response.storyGroups;
      },
      error: (error) => {
        console.error('Error loading stories:', error);
        this.storyGroups = [];
      }
    });
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
