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
        this.posts = [];
      }
    });
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
