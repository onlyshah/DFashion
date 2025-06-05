import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <article class="post">
      <!-- Post Header -->
      <div class="post-header">
        <div class="user-info">
          <img [src]="post.user.avatar" [alt]="post.user.fullName" class="user-avatar">
          <div class="user-details">
            <h4>{{ post.user.username }}</h4>
            <span>{{ getTimeAgo(post.createdAt) }}</span>
          </div>
        </div>
        <button class="more-options">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>

      <!-- Post Media -->
      <div class="post-media">
        <img [src]="post.media[0].url" [alt]="post.media[0].alt" class="post-image">
        
        <!-- Product Tags -->
        <div class="product-tags">
          <div 
            *ngFor="let productTag of post.products" 
            class="product-tag"
            [style.top.%]="productTag.position.y"
            [style.left.%]="productTag.position.x"
          >
            <div class="tag-dot"></div>
            <div class="product-info">
              <img [src]="productTag.product.images[0].url" [alt]="productTag.product.name">
              <div class="product-details">
                <h5>{{ productTag.product.name }}</h5>
                <p>₹{{ productTag.product.price | number }}</p>
                <button class="buy-now-btn" (click)="onBuyNow(productTag.product._id)">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Post Actions -->
      <div class="post-actions">
        <div class="action-buttons">
          <button 
            class="action-btn like-btn" 
            [class.liked]="isLiked"
            (click)="toggleLike()"
          >
            <i [class]="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>
          <button class="action-btn">
            <i class="far fa-comment"></i>
          </button>
          <button class="action-btn" (click)="sharePost()">
            <i class="far fa-share"></i>
          </button>
        </div>
        <button class="save-btn" [class.saved]="isSaved" (click)="toggleSave()">
          <i [class]="isSaved ? 'fas fa-bookmark' : 'far fa-bookmark'"></i>
        </button>
      </div>

      <!-- Post Stats -->
      <div class="post-stats">
        <p><strong>{{ likesCount }} likes</strong></p>
      </div>

      <!-- Post Caption -->
      <div class="post-caption">
        <p>
          <strong>{{ post.user.username }}</strong> 
          <span [innerHTML]="formatCaption(post.caption)"></span>
        </p>
      </div>

      <!-- Post Comments -->
      <div class="post-comments">
        <p class="view-comments" *ngIf="post.comments.length > 0">
          View all {{ post.comments.length }} comments
        </p>
        
        <!-- Recent Comments -->
        <div *ngFor="let comment of getRecentComments()" class="comment">
          <p>
            <strong>{{ comment.user.username }}</strong>
            {{ comment.text }}
          </p>
        </div>

        <!-- Add Comment -->
        <div class="add-comment">
          <input 
            type="text" 
            placeholder="Add a comment..."
            [(ngModel)]="newComment"
            (keyup.enter)="addComment()"
          >
          <button 
            *ngIf="newComment.trim()" 
            (click)="addComment()"
            class="post-comment-btn"
          >
            Post
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .post {
      background: #fff;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      overflow: hidden;
    }

    .post-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-details h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .user-details span {
      font-size: 12px;
      color: #8e8e8e;
    }

    .more-options {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #262626;
    }

    .post-media {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
    }

    .post-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-tags {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .product-tag {
      position: absolute;
      cursor: pointer;
    }

    .tag-dot {
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      position: relative;
      animation: pulse 2s infinite;
    }

    .tag-dot::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 149, 246, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(0, 149, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 149, 246, 0); }
    }

    .product-info {
      position: absolute;
      top: -120px;
      left: -100px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 12px;
      width: 200px;
      display: none;
      z-index: 10;
    }

    .product-tag:hover .product-info {
      display: block;
    }

    .product-info img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
      float: left;
      margin-right: 12px;
    }

    .product-details h5 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .product-details p {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .buy-now-btn {
      background: var(--primary-color);
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
    }

    .post-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
    }

    .action-btn,
    .save-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      font-size: 20px;
      color: #262626;
      transition: color 0.2s;
    }

    .action-btn:hover,
    .save-btn:hover {
      color: #8e8e8e;
    }

    .like-btn.liked {
      color: #ed4956;
    }

    .save-btn.saved {
      color: #262626;
    }

    .post-stats {
      padding: 0 16px;
      margin-bottom: 8px;
    }

    .post-stats p {
      font-size: 14px;
      font-weight: 600;
    }

    .post-caption {
      padding: 0 16px;
      margin-bottom: 8px;
    }

    .post-caption p {
      font-size: 14px;
      line-height: 1.4;
    }

    .post-comments {
      padding: 0 16px 16px;
    }

    .view-comments {
      font-size: 14px;
      color: #8e8e8e;
      cursor: pointer;
      margin-bottom: 8px;
    }

    .comment {
      margin-bottom: 4px;
    }

    .comment p {
      font-size: 14px;
    }

    .add-comment {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .add-comment input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      background: transparent;
    }

    .post-comment-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }

    .hashtag {
      color: var(--primary-color);
      cursor: pointer;
    }
  `]
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() liked = new EventEmitter<string>();
  @Output() commented = new EventEmitter<{ postId: string; comment: string }>();
  @Output() shared = new EventEmitter<string>();

  isLiked = false;
  isSaved = false;
  likesCount = 0;
  newComment = '';

  ngOnInit() {
    this.likesCount = this.post.analytics.likes;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  formatCaption(caption: string): string {
    return caption.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  }

  getRecentComments() {
    return this.post.comments.slice(-2);
  }

  toggleLike() {
    this.isLiked = !this.isLiked;
    this.likesCount += this.isLiked ? 1 : -1;
    this.liked.emit(this.post._id);
  }

  toggleSave() {
    this.isSaved = !this.isSaved;
  }

  addComment() {
    if (this.newComment.trim()) {
      this.commented.emit({
        postId: this.post._id,
        comment: this.newComment.trim()
      });
      this.newComment = '';
    }
  }

  sharePost() {
    this.shared.emit(this.post._id);
  }

  onBuyNow(productId: string) {
    console.log('Buy now clicked for product:', productId);
    // TODO: Implement buy now functionality
  }
}
