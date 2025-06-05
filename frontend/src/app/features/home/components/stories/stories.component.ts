import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    private authService: AuthService
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
        // Load mock data for demo when backend is not available
        this.loadMockStories();
      }
    });
  }

  loadMockStories() {
    this.storyGroups = [
      {
        user: {
          _id: '1',
          username: 'fashionista_maya',
          fullName: 'Maya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          socialStats: { followersCount: 1250 }
        },
        stories: [
          {
            _id: '1',
            user: {
              _id: '1',
              username: 'fashionista_maya',
              fullName: 'Maya Sharma',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
              socialStats: { followersCount: 1250 }
            },
            media: {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400'
            },
            caption: 'Perfect outfit for brunch! 🥐☕',
            products: [],
            viewers: [],
            likes: [],
            shares: [],
            isActive: true,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            analytics: { views: 450, likes: 89, shares: 12, productClicks: 23, purchases: 5 },
            settings: { allowComments: true, allowSharing: true, visibility: 'public' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      },
      {
        user: {
          _id: '2',
          username: 'style_guru_raj',
          fullName: 'Raj Patel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          socialStats: { followersCount: 5600 }
        },
        stories: []
      },
      {
        user: {
          _id: '3',
          username: 'trendy_priya',
          fullName: 'Priya Singh',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          socialStats: { followersCount: 890 }
        },
        stories: []
      },
      {
        user: {
          _id: '4',
          username: 'ethnic_elegance',
          fullName: 'Anita Desai',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          socialStats: { followersCount: 8900 }
        },
        stories: []
      }
    ];
  }

  openAddStory() {
    console.log('Open add story modal');
    // TODO: Implement add story functionality
  }

  openStoryViewer(storyGroup: StoryGroup) {
    console.log('Open story viewer for:', storyGroup.user.username);
    // TODO: Implement story viewer
  }
}
