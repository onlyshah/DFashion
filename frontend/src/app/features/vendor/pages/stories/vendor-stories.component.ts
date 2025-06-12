import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-stories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-stories-container">
      <div class="header">
        <h1>My Stories</h1>
        <a routerLink="/vendor/stories/create" class="btn-primary">
          <i class="fas fa-plus"></i> Create Story
        </a>
      </div>

      <!-- Stories Grid -->
      <div class="stories-grid" *ngIf="stories.length > 0">
        <div class="story-card" *ngFor="let story of stories">
          <div class="story-media">
            <img *ngIf="story.media.type === 'image'" [src]="story.media.url" [alt]="story.caption">
            <video *ngIf="story.media.type === 'video'" [src]="story.media.url" muted></video>
            <div class="story-type">
              <i [class]="story.media.type === 'video' ? 'fas fa-play' : 'fas fa-image'"></i>
            </div>
            <div class="story-duration">{{ getTimeRemaining(story.createdAt) }}</div>
          </div>
          
          <div class="story-content">
            <p class="story-caption" *ngIf="story.caption">{{ story.caption | slice:0:80 }}{{ story.caption.length > 80 ? '...' : '' }}</p>
            
            <div class="story-stats">
              <span><i class="fas fa-eye"></i> {{ story.views || 0 }}</span>
              <span><i class="fas fa-reply"></i> {{ story.replies || 0 }}</span>
              <span><i class="fas fa-shopping-bag"></i> {{ story.productClicks || 0 }}</span>
            </div>

            <div class="story-products" *ngIf="story.taggedProducts && story.taggedProducts.length > 0">
              <h4>Tagged Products:</h4>
              <div class="tagged-products">
                <span class="product-tag" *ngFor="let product of story.taggedProducts">
                  {{ product.name }}
                </span>
              </div>
            </div>

            <div class="story-meta">
              <span class="story-date">{{ story.createdAt | date:'short' }}</span>
              <span class="story-status" [class]="getStoryStatus(story.createdAt)">
                {{ getStoryStatus(story.createdAt) }}
              </span>
            </div>
          </div>
          
          <div class="story-actions">
            <button class="btn-view" (click)="viewStory(story)">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="btn-analytics" (click)="viewAnalytics(story)">
              <i class="fas fa-chart-bar"></i> Analytics
            </button>
            <button class="btn-delete" (click)="deleteStory(story)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="stories.length === 0">
        <div class="empty-content">
          <i class="fas fa-play-circle"></i>
          <h2>No stories yet</h2>
          <p>Create engaging 24-hour stories to showcase your products</p>
          <a routerLink="/vendor/stories/create" class="btn-primary">Create Your First Story</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-stories-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
    }

    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .story-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .story-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .story-media {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: #000;
    }

    .story-media img,
    .story-media video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .story-type {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 6px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
    }

    .story-duration {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .story-content {
      padding: 16px;
    }

    .story-caption {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 12px;
      color: #333;
    }

    .story-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 0.85rem;
      color: #666;
    }

    .story-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .story-products {
      margin-bottom: 12px;
    }

    .story-products h4 {
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }

    .tagged-products {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .product-tag {
      background: #f0f8ff;
      color: #007bff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .story-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #666;
    }

    .story-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .story-status.active {
      background: #d4edda;
      color: #155724;
    }

    .story-status.expired {
      background: #f8d7da;
      color: #721c24;
    }

    .story-actions {
      display: flex;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .btn-view, .btn-analytics, .btn-delete {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view {
      background: #e7f3ff;
      color: #007bff;
    }

    .btn-view:hover {
      background: #cce7ff;
    }

    .btn-analytics {
      background: #f8f9fa;
      color: #495057;
    }

    .btn-analytics:hover {
      background: #e9ecef;
    }

    .btn-delete {
      background: #fee;
      color: #dc3545;
    }

    .btn-delete:hover {
      background: #fdd;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-content i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .empty-content p {
      color: #666;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .stories-grid {
        grid-template-columns: 1fr;
      }

      .story-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VendorStoriesComponent implements OnInit {
  stories: any[] = [];

  constructor() {}

  ngOnInit() {
    this.loadStories();
  }

  loadStories() {
    // Load vendor stories from API
    this.stories = [];
  }

  getTimeRemaining(createdAt: Date): string {
    const now = new Date();
    const storyTime = new Date(createdAt);
    const diffMs = now.getTime() - storyTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const remainingHours = 24 - diffHours;

    if (remainingHours <= 0) {
      return 'Expired';
    } else if (remainingHours < 1) {
      const remainingMinutes = 60 - Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${remainingMinutes}m left`;
    } else {
      return `${remainingHours}h left`;
    }
  }

  getStoryStatus(createdAt: Date): string {
    const now = new Date();
    const storyTime = new Date(createdAt);
    const diffHours = (now.getTime() - storyTime.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 24 ? 'expired' : 'active';
  }

  viewStory(story: any) {
    // TODO: Open story viewer
    console.log('View story:', story);
  }

  viewAnalytics(story: any) {
    // TODO: Show story analytics
    console.log('View analytics for story:', story);
  }

  deleteStory(story: any) {
    if (confirm('Are you sure you want to delete this story?')) {
      // TODO: Implement delete API call
      this.stories = this.stories.filter(s => s._id !== story._id);
    }
  }
}
