import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StoryGroup {
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  stories: {
    _id: string;
    media: {
      type: 'image' | 'video';
      url: string;
      thumbnail?: string;
    };
    isViewed: boolean;
    createdAt: Date;
  }[];
  totalStories: number;
  hasUnviewed: boolean;
}

@Component({
  selector: 'app-stories-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stories-grid-container">
      <!-- Grid Header -->
      <div class="grid-header">
        <h3>All Stories</h3>
        <div class="view-options">
          <button class="view-btn" 
                  [class.active]="viewMode === 'grid'"
                  (click)="setViewMode('grid')">
            <i class="fas fa-th"></i>
          </button>
          <button class="view-btn" 
                  [class.active]="viewMode === 'list'"
                  (click)="setViewMode('list')">
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>

      <!-- Stories Grid -->
      <div class="stories-grid" 
           [class.grid-view]="viewMode === 'grid'"
           [class.list-view]="viewMode === 'list'">
        
        <div class="story-group" 
             *ngFor="let group of storyGroups"
             (click)="openStoryGroup(group)">
          
          <!-- Grid View -->
          <div class="grid-item" *ngIf="viewMode === 'grid'">
            <div class="story-preview">
              <img [src]="getPreviewImage(group)" 
                   [alt]="group.user.fullName"
                   class="preview-image">
              
              <!-- Story Ring -->
              <div class="story-ring" *ngIf="group.hasUnviewed"></div>
              
              <!-- Story Count -->
              <div class="story-count" *ngIf="group.totalStories > 1">
                {{ group.totalStories }}
              </div>
              
              <!-- Video Indicator -->
              <div class="video-indicator" *ngIf="hasVideo(group)">
                <i class="fas fa-play"></i>
              </div>
            </div>
            
            <div class="user-info">
              <img [src]="group.user.avatar || 'assets/images/default-avatar.svg'" 
                   [alt]="group.user.fullName"
                   class="user-avatar">
              <div class="user-details">
                <span class="username">{{ group.user.username }}</span>
                <span class="story-time">{{ getLatestTime(group) }}</span>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div class="list-item" *ngIf="viewMode === 'list'">
            <div class="user-section">
              <div class="user-avatar-container">
                <img [src]="group.user.avatar || 'assets/images/default-avatar.svg'" 
                     [alt]="group.user.fullName"
                     class="user-avatar">
                <div class="story-ring" *ngIf="group.hasUnviewed"></div>
              </div>
              
              <div class="user-details">
                <span class="username">{{ group.user.fullName }}</span>
                <span class="story-info">
                  {{ group.totalStories }} {{ group.totalStories === 1 ? 'story' : 'stories' }} • 
                  {{ getLatestTime(group) }}
                </span>
              </div>
            </div>
            
            <div class="stories-preview">
              <div class="preview-item" 
                   *ngFor="let story of group.stories.slice(0, 3)"
                   [class.viewed]="story.isViewed">
                <img [src]="getStoryThumbnail(story)" 
                     [alt]="'Story'"
                     class="preview-thumbnail">
                <div class="video-indicator" *ngIf="story.media.type === 'video'">
                  <i class="fas fa-play"></i>
                </div>
              </div>
              
              <div class="more-indicator" *ngIf="group.totalStories > 3">
                +{{ group.totalStories - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-grid" *ngIf="loading">
        <div class="loading-item" *ngFor="let item of [1,2,3,4,5,6]">
          <div class="skeleton-preview"></div>
          <div class="skeleton-user">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-text">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && storyGroups.length === 0">
        <i class="fas fa-camera-retro"></i>
        <h4>No Stories Available</h4>
        <p>Check back later for new stories from users and vendors!</p>
      </div>
    </div>
  `,
  styles: [`
    .stories-grid-container {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .grid-header h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
    }

    .view-options {
      display: flex;
      gap: 8px;
    }

    .view-btn {
      width: 36px;
      height: 36px;
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #666;
    }

    .view-btn:hover,
    .view-btn.active {
      background: #007bff;
      border-color: #007bff;
      color: #fff;
    }

    .stories-grid.grid-view {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .stories-grid.list-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .story-group {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .story-group:hover {
      transform: translateY(-4px);
    }

    /* Grid View Styles */
    .grid-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .story-preview {
      position: relative;
      aspect-ratio: 9/16;
      border-radius: 12px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .story-ring {
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border: 3px solid;
      border-image: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c) 1;
      border-radius: 12px;
    }

    .story-count {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .video-indicator {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.8rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .username {
      font-weight: 500;
      font-size: 0.9rem;
      color: #333;
    }

    .story-time {
      font-size: 0.8rem;
      color: #666;
    }

    /* List View Styles */
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #eee;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .list-item:hover {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0,123,255,0.1);
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar-container {
      position: relative;
    }

    .user-avatar-container .user-avatar {
      width: 48px;
      height: 48px;
    }

    .user-avatar-container .story-ring {
      border-radius: 50%;
    }

    .story-info {
      font-size: 0.85rem;
      color: #666;
    }

    .stories-preview {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .preview-item {
      position: relative;
      width: 40px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .preview-item.viewed {
      opacity: 0.6;
    }

    .preview-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-item .video-indicator {
      width: 16px;
      height: 16px;
      bottom: 4px;
      right: 4px;
      font-size: 0.6rem;
    }

    .more-indicator {
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    /* Loading States */
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .loading-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-preview {
      aspect-ratio: 9/16;
      border-radius: 12px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-user {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .skeleton-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .skeleton-line {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    .skeleton-line.short {
      width: 60%;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-state h4 {
      margin: 0 0 12px 0;
      font-size: 1.2rem;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .stories-grid-container {
        padding: 16px;
      }

      .grid-header h3 {
        font-size: 1.2rem;
      }

      .stories-grid.grid-view {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }

      .stories-grid.list-view {
        gap: 12px;
      }

      .list-item {
        padding: 12px;
      }

      .user-avatar-container .user-avatar {
        width: 40px;
        height: 40px;
      }

      .preview-item {
        width: 32px;
        height: 48px;
      }

      .loading-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .stories-grid.grid-view {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .view-options {
        display: none;
      }

      .list-item {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .stories-preview {
        align-self: stretch;
        justify-content: space-between;
      }
    }
  `]
})
export class StoriesGridComponent implements OnInit {
  @Input() storyGroups: StoryGroup[] = [];
  @Input() loading = false;

  viewMode: 'grid' | 'list' = 'grid';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadStoryGroups();
  }

  loadStoryGroups() {
    this.loading = true;
    
    fetch('http://localhost:5000/api/stories/groups')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.storyGroups = data.groups;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading story groups:', error);
        this.loading = false;
      });
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  openStoryGroup(group: StoryGroup) {
    this.router.navigate(['/stories', group.user._id]);
  }

  getPreviewImage(group: StoryGroup): string {
    const latestStory = group.stories[0];
    return latestStory.media.type === 'video' 
      ? latestStory.media.thumbnail || 'assets/images/default-story.svg'
      : latestStory.media.url;
  }

  getStoryThumbnail(story: any): string {
    return story.media.type === 'video'
      ? story.media.thumbnail || 'assets/images/default-story.svg'
      : story.media.url;
  }

  hasVideo(group: StoryGroup): boolean {
    return group.stories.some(story => story.media.type === 'video');
  }

  getLatestTime(group: StoryGroup): string {
    const latestDate = new Date(group.stories[0].createdAt);
    const now = new Date();
    const diffMs = now.getTime() - latestDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }
}
