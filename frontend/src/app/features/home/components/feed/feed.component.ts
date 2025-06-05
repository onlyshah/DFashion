import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostService } from '../../../../core/services/post.service';
import { Post } from '../../../../core/models/post.model';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="feed-section">
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>

      <div *ngIf="!loading && posts.length === 0" class="empty-feed">
        <i class="fas fa-camera"></i>
        <h3>No posts yet</h3>
        <p>Follow some users to see their posts in your feed</p>
      </div>

      <div class="posts-container">
        <app-post-card 
          *ngFor="let post of posts; trackBy: trackByPostId" 
          [post]="post"
          (liked)="onPostLiked($event)"
          (commented)="onPostCommented($event)"
          (shared)="onPostShared($event)"
        ></app-post-card>
      </div>

      <div *ngIf="hasMore && !loading" class="load-more">
        <button (click)="loadMorePosts()" class="btn-primary">
          Load More Posts
        </button>
      </div>
    </div>
  `,
  styles: [`
    .feed-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #dbdbdb;
    }

    .loading-container p {
      margin-top: 16px;
      color: #8e8e8e;
    }

    .empty-feed {
      text-align: center;
      padding: 60px 40px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #dbdbdb;
    }

    .empty-feed i {
      font-size: 48px;
      color: #dbdbdb;
      margin-bottom: 16px;
    }

    .empty-feed h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #262626;
    }

    .empty-feed p {
      color: #8e8e8e;
      font-size: 14px;
    }

    .posts-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .load-more {
      text-align: center;
      padding: 20px;
    }

    .load-more button {
      padding: 12px 24px;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .feed-section {
        gap: 20px;
      }

      .posts-container {
        gap: 20px;
      }

      .empty-feed {
        padding: 40px 20px;
      }
    }
  `]
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  hasMore = true;
  currentPage = 1;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;

    this.postService.getPosts(this.currentPage).subscribe({
      next: (response) => {
        if (this.currentPage === 1) {
          this.posts = response.posts;
        } else {
          this.posts = [...this.posts, ...response.posts];
        }

        this.hasMore = response.pagination.current < response.pagination.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
        // Load mock data for demo when backend is not available
        this.loadMockPosts();
      }
    });
  }

  loadMockPosts() {
    // Mock posts data for demo
    this.posts = [
      {
        _id: '1',
        user: {
          _id: '1',
          username: 'fashionista_maya',
          fullName: 'Maya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          socialStats: { followersCount: 1250 }
        },
        caption: 'Loving this new floral dress! Perfect for the summer vibes 🌸 #SummerFashion #FloralDress #OOTD',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
            alt: 'Summer floral dress outfit'
          }
        ],
        products: [
          {
            product: {
              _id: 'p1',
              name: 'Floral Maxi Dress',
              price: 2499,
              images: [{ url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100', isPrimary: true }],
              brand: 'StyleCraft'
            },
            position: { x: 40, y: 50 },
            size: 'M',
            color: 'Blue Floral'
          }
        ],
        hashtags: ['SummerFashion', 'FloralDress', 'OOTD', 'StyleInspo'],
        mentions: [],
        likes: [],
        comments: [],
        shares: [],
        saves: [],
        isActive: true,
        visibility: 'public',
        analytics: { views: 1250, likes: 189, comments: 23, shares: 45, saves: 67, productClicks: 89, purchases: 12 },
        settings: { allowComments: true, allowSharing: true },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date()
      },
      {
        _id: '2',
        user: {
          _id: '2',
          username: 'style_guru_raj',
          fullName: 'Raj Patel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          socialStats: { followersCount: 5600 }
        },
        caption: 'Perfect formal shirt for office meetings! Quality fabric and great fit 👔 #FormalWear #OfficeStyle',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
            alt: 'Formal shirt'
          }
        ],
        products: [
          {
            product: {
              _id: 'p2',
              name: 'Classic White Shirt',
              price: 1899,
              images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100', isPrimary: true }],
              brand: 'StyleCraft'
            },
            position: { x: 50, y: 50 },
            size: 'L',
            color: 'White'
          }
        ],
        hashtags: ['FormalWear', 'OfficeStyle'],
        mentions: [],
        likes: [],
        comments: [],
        shares: [],
        saves: [],
        isActive: true,
        visibility: 'public',
        analytics: { views: 890, likes: 156, comments: 12, shares: 23, saves: 34, productClicks: 67, purchases: 8 },
        settings: { allowComments: true, allowSharing: true },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date()
      }
    ];
    this.loading = false;
  }

  loadMorePosts() {
    this.currentPage++;
    this.loadPosts();
  }

  trackByPostId(index: number, post: Post): string {
    return post._id;
  }

  onPostLiked(postId: string) {
    console.log('Post liked:', postId);
    // Handle post like
  }

  onPostCommented(data: { postId: string; comment: string }) {
    console.log('Post commented:', data);
    // Handle post comment
  }

  onPostShared(postId: string) {
    console.log('Post shared:', postId);
    // Handle post share
  }
}
