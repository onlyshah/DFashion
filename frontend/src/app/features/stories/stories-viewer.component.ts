import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    duration: number;
    thumbnail?: string;
  };
  caption?: string;
  products: {
    _id: string;
    product: {
      _id: string;
      name: string;
      price: number;
      originalPrice?: number;
      images: { url: string; alt: string }[];
      brand: string;
    };
    position: { x: number; y: number };
  }[];
  viewers: { user: string; viewedAt: Date }[];
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-stories-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stories-viewer" *ngIf="currentStory"
         (click)="handleStoryClick($event)"
         (keydown)="handleKeyDown($event)"
         tabindex="0">

      <!-- Progress Bars -->
      <div class="progress-container">
        <div class="progress-bar"
             *ngFor="let story of stories; let i = index"
             [class.active]="i === currentIndex"
             [class.completed]="i < currentIndex">
          <div class="progress-fill"
               [style.width.%]="getProgressWidth(i)"
               [style.animation-duration.s]="getStoryDuration(story)"></div>
        </div>
      </div>

      <!-- Header -->
      <div class="story-header">
        <div class="user-info">
          <img [src]="currentStory.user.avatar || '/assets/images/default-avatar.png'"
               [alt]="currentStory.user.fullName" class="user-avatar">
          <div class="user-details">
            <span class="username">{{ currentStory.user.username }}</span>
            <span class="timestamp">{{ getTimeAgo(currentStory.createdAt) }}</span>
          </div>
        </div>

        <div class="story-controls">
          <button class="btn-sound"
                  *ngIf="currentStory.media.type === 'video'"
                  (click)="toggleSound()"
                  [class.muted]="isMuted">
            <i class="fas" [class.fa-volume-up]="!isMuted" [class.fa-volume-mute]="isMuted"></i>
          </button>
          <button class="btn-pause" (click)="togglePause()" [class.paused]="isPaused">
            <i class="fas" [class.fa-pause]="!isPaused" [class.fa-play]="isPaused"></i>
          </button>
          <button class="btn-close" (click)="closeStories()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Story Content -->
      <div class="story-content"
           (touchstart)="onTouchStart($event)"
           (touchend)="onTouchEnd($event)"
           (mousedown)="onMouseDown($event)"
           (mouseup)="onMouseUp($event)">

        <!-- Navigation Areas -->
        <div class="nav-area nav-prev" (click)="previousStory()"></div>
        <div class="nav-area nav-next" (click)="nextStory()"></div>

        <!-- Image Story -->
        <img *ngIf="currentStory.media.type === 'image'"
             [src]="currentStory.media.url"
             [alt]="currentStory.caption"
             class="story-media"
             (load)="onMediaLoaded()"
             #storyMedia>

        <!-- Video Story -->
        <video *ngIf="currentStory.media.type === 'video'"
               [src]="currentStory.media.url"
               class="story-media"
               [poster]="currentStory.media.thumbnail"
               [muted]="isMuted"
               [autoplay]="!isPaused"
               [loop]="false"
               #storyVideo
               (loadeddata)="onMediaLoaded()"
               (ended)="nextStory()">
        </video>

        <!-- Product Tags (Instagram-style) -->
        <div class="product-tags"
             [class.show-tags]="showProductTags"
             *ngIf="currentStory.products && currentStory.products.length > 0">
          <div class="product-tag"
               *ngFor="let productTag of currentStory.products"
               [style.left.%]="productTag.position.x"
               [style.top.%]="productTag.position.y"
               (click)="showProductModal(productTag.product); $event.stopPropagation()">
            <div class="product-dot">
              <div class="product-pulse"></div>
            </div>
            <div class="product-info">
              <span class="product-name">{{ productTag.product.name }}</span>
              <span class="product-price">₹{{ productTag.product.price | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Shopping indicator -->
        <div class="shopping-indicator"
             *ngIf="currentStory.products && currentStory.products.length > 0 && !showProductTags"
             (click)="toggleProductTags(); $event.stopPropagation()">
          <i class="fas fa-shopping-bag"></i>
          <span>Tap to view products</span>
        </div>

        <!-- Caption -->
        <div class="story-caption" *ngIf="currentStory.caption">
          {{ currentStory.caption }}
        </div>
      </div>

      <!-- Story Navigation Slider (for many stories) -->
      <div class="story-navigation" *ngIf="stories.length > 5">
        <div class="nav-slider-container">
          <button class="nav-slider-btn prev"
                  (click)="scrollStoriesLeft()"
                  [disabled]="!canScrollLeft">
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="story-thumbnails" #storyThumbnails>
            <div class="story-thumbnail"
                 *ngFor="let story of stories; let i = index"
                 [class.active]="i === currentIndex"
                 [class.viewed]="i < currentIndex"
                 (click)="jumpToStoryIndex(i)">
              <img [src]="getStoryThumbnail(story)"
                   [alt]="story.user.username"
                   class="thumbnail-image">
              <div class="thumbnail-overlay">
                <img [src]="story.user.avatar || '/assets/images/default-avatar.png'"
                     [alt]="story.user.fullName"
                     class="user-thumbnail-avatar">
              </div>
              <div class="thumbnail-progress"
                   [style.width.%]="getThumbnailProgress(i)"></div>
            </div>
          </div>

          <button class="nav-slider-btn next"
                  (click)="scrollStoriesRight()"
                  [disabled]="!canScrollRight">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Story Content -->
      <div class="story-content">
        <!-- Image Story -->
        <img *ngIf="currentStory.media.type === 'image'" 
             [src]="currentStory.media.url" 
             [alt]="currentStory.caption"
             class="story-media"
             #storyMedia>

        <!-- Video Story -->
        <video *ngIf="currentStory.media.type === 'video'"
               [src]="currentStory.media.url"
               class="story-media"
               [poster]="currentStory.media.thumbnail"
               [muted]="isMuted"
               [autoplay]="true"
               [loop]="false"
               #storyVideo
               (ended)="nextStory()">
        </video>

        <!-- Product Tags -->
        <div class="product-tags">
          <div class="product-tag" 
               *ngFor="let productTag of currentStory.products"
               [style.left.%]="productTag.position.x"
               [style.top.%]="productTag.position.y"
               (click)="showProductModal(productTag.product)">
            <div class="product-tag-icon">
              <i class="fas fa-shopping-bag"></i>
            </div>
            <div class="product-tag-info">
              <span class="product-name">{{ productTag.product.name }}</span>
              <span class="product-price">₹{{ productTag.product.price | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Caption -->
        <div class="story-caption" *ngIf="currentStory.caption">
          {{ currentStory.caption }}
        </div>
      </div>

      <!-- Navigation Areas -->
      <div class="nav-area nav-prev" (click)="previousStory()"></div>
      <div class="nav-area nav-next" (click)="nextStory()"></div>

      <!-- Bottom Actions -->
      <div class="story-actions">
        <!-- E-commerce Actions -->
        <div class="ecommerce-actions" *ngIf="currentStory.products && currentStory.products.length > 0">
          <button class="action-btn buy-now"
                  (click)="buyNow()"
                  title="Buy Now"
                  [attr.aria-label]="'Buy Now - ' + getProductName()">
            <i class="fas fa-bolt"></i>
            <span class="btn-text">Buy Now</span>
            <span class="tooltip">Buy Now</span>
          </button>
          <button class="action-btn add-cart"
                  (click)="addToCart()"
                  title="Add to Cart"
                  [attr.aria-label]="'Add to Cart - ' + getProductName()">
            <i class="fas fa-shopping-cart"></i>
            <span class="btn-text">Add to Cart</span>
            <span class="tooltip">Add to Cart</span>
          </button>
          <button class="action-btn wishlist"
                  (click)="addToWishlist()"
                  title="Add to Wishlist"
                  [attr.aria-label]="'Add to Wishlist - ' + getProductName()">
            <i class="fas fa-heart"></i>
            <span class="btn-text">Wishlist</span>
            <span class="tooltip">Add to Wishlist</span>
          </button>
        </div>

        <!-- Social Actions -->
        <div class="social-actions">
          <button class="social-btn like"
                  [class.liked]="isLiked"
                  (click)="toggleLike()"
                  title="Like Story"
                  aria-label="Like this story">
            <i class="fas fa-heart"></i>
            <span class="tooltip">{{ isLiked ? 'Unlike' : 'Like' }}</span>
          </button>
          <button class="social-btn comment"
                  (click)="openComments()"
                  title="Comment on Story"
                  aria-label="Comment on this story">
            <i class="fas fa-comment"></i>
            <span class="tooltip">Comment</span>
          </button>
          <button class="social-btn share"
                  (click)="shareStory()"
                  title="Share Story"
                  aria-label="Share this story">
            <i class="fas fa-share"></i>
            <span class="tooltip">Share</span>
          </button>
          <button class="social-btn sound"
                  (click)="toggleSound()"
                  *ngIf="currentStory.media.type === 'video'"
                  title="Toggle Sound"
                  aria-label="Toggle sound on/off">
            <i class="fas" [class.fa-volume-up]="!isMuted" [class.fa-volume-mute]="isMuted"></i>
            <span class="tooltip">{{ isMuted ? 'Unmute' : 'Mute' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="product-modal" *ngIf="selectedProduct" (click)="closeProductModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedProduct.name }}</h3>
          <button class="btn-close" (click)="closeProductModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <img [src]="selectedProduct.images[0]?.url" [alt]="selectedProduct.name" class="product-image">
          
          <div class="product-details">
            <p class="brand">{{ selectedProduct.brand }}</p>
            <div class="price">
              <span class="current-price">₹{{ selectedProduct.price | number:'1.0-0' }}</span>
              <span class="original-price" *ngIf="selectedProduct.originalPrice">
                ₹{{ selectedProduct.originalPrice | number:'1.0-0' }}
              </span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-primary" (click)="buyProductNow()">Buy Now</button>
            <button class="btn-secondary" (click)="addProductToCart()">Add to Cart</button>
            <button class="btn-outline" (click)="addProductToWishlist()">Add to Wishlist</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments Modal -->
    <div class="comments-modal" *ngIf="showCommentsModal" (click)="closeComments()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Comments</h3>
          <button class="btn-close" (click)="closeComments()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="comments-list">
          <div class="comment" *ngFor="let comment of comments">
            <img [src]="comment.user.avatar || '/assets/images/default-avatar.png'" 
                 [alt]="comment.user.fullName" class="comment-avatar">
            <div class="comment-content">
              <span class="comment-username">{{ comment.user.username }}</span>
              <p class="comment-text">{{ comment.text }}</p>
              <span class="comment-time">{{ getTimeAgo(comment.commentedAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="comment-input">
          <input type="text" 
                 [(ngModel)]="newComment" 
                 placeholder="Add a comment..."
                 (keyup.enter)="addComment()">
          <button (click)="addComment()" [disabled]="!newComment.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stories-viewer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    .story-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
      position: relative;
      z-index: 10;
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
      border: 2px solid #fff;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      color: #fff;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .timestamp {
      color: rgba(255,255,255,0.7);
      font-size: 0.8rem;
    }

    .btn-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
    }

    .progress-container {
      display: flex;
      gap: 2px;
      padding: 0 20px;
      position: absolute;
      top: 8px;
      left: 0;
      right: 0;
      z-index: 10;
    }

    .progress-bar {
      flex: 1;
      height: 2px;
      background: rgba(255,255,255,0.3);
      border-radius: 1px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #fff;
      width: 0%;
      transition: width 0.1s ease;
    }

    .progress-bar.active .progress-fill {
      animation: progress linear;
    }

    .progress-bar.completed .progress-fill {
      width: 100%;
    }

    @keyframes progress {
      from { width: 0%; }
      to { width: 100%; }
    }

    /* Story Navigation Slider */
    .story-navigation {
      position: absolute;
      top: 70px;
      left: 0;
      right: 0;
      z-index: 15;
      background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%);
      padding: 12px 0;
    }

    .nav-slider-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
    }

    .nav-slider-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .nav-slider-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }

    .nav-slider-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .story-thumbnails {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      flex: 1;
      padding: 4px 0;
    }

    .story-thumbnails::-webkit-scrollbar {
      display: none;
    }

    .story-thumbnail {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      border: 2px solid transparent;
    }

    .story-thumbnail.active {
      border-color: #fff;
      transform: scale(1.1);
    }

    .story-thumbnail.viewed {
      opacity: 0.6;
    }

    .story-thumbnail:hover {
      transform: scale(1.05);
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-overlay {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #000;
      overflow: hidden;
    }

    .user-thumbnail-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: #fff;
      transition: width 0.3s ease;
      border-radius: 0 0 50px 50px;
    }

    .story-content {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .story-media {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    /* Instagram-style Product Tags */
    .product-tags {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-tags.show-tags {
      opacity: 1;
    }

    .product-tag {
      position: absolute;
      pointer-events: all;
      cursor: pointer;
      transform: translate(-50%, -50%);
    }

    .product-dot {
      position: relative;
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
    }

    .product-dot::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #000;
      border-radius: 50%;
    }

    .product-pulse {
      position: absolute;
      width: 140%;
      height: 140%;
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: productPulse 2s infinite;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .product-info {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      margin-bottom: 8px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .product-info::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.8);
    }

    .product-tag:hover .product-info {
      opacity: 1;
    }

    .shopping-indicator {
      position: absolute;
      bottom: 120px;
      left: 16px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      backdrop-filter: blur(10px);
      animation: fadeInUp 0.3s ease;
      cursor: pointer;
    }

    .shopping-indicator i {
      font-size: 14px;
    }

    @keyframes productPulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.4);
        opacity: 0;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .product-tag {
      position: absolute;
      pointer-events: all;
      cursor: pointer;
      transform: translate(-50%, -50%);
    }

    .product-tag-icon {
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      animation: pulse 2s infinite;
    }

    .product-tag-info {
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      white-space: nowrap;
      font-size: 0.8rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-tag:hover .product-tag-info {
      opacity: 1;
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    .story-caption {
      position: absolute;
      bottom: 120px;
      left: 20px;
      right: 20px;
      color: #fff;
      font-size: 0.9rem;
      line-height: 1.4;
      background: rgba(0,0,0,0.5);
      padding: 12px;
      border-radius: 8px;
    }

    .nav-area {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 30%;
      cursor: pointer;
      z-index: 5;
    }

    .nav-prev {
      left: 0;
    }

    .nav-next {
      right: 0;
    }

    .story-actions {
      padding: 20px;
      background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%);
    }

    .ecommerce-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .action-btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
      position: relative;
    }

    .action-btn .btn-text {
      display: inline;
    }

    .action-btn .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      margin-bottom: 8px;
      z-index: 1000;
    }

    .action-btn .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.9);
    }

    .action-btn:hover .tooltip {
      opacity: 1;
    }

    .buy-now {
      background: #ff6b6b;
      color: #fff;
    }

    .add-cart {
      background: #4ecdc4;
      color: #fff;
    }

    .wishlist {
      background: #ff9ff3;
      color: #fff;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .social-actions {
      display: flex;
      justify-content: center;
      gap: 24px;
    }

    .social-btn {
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      color: #fff;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      position: relative;
    }

    .social-btn .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      margin-bottom: 8px;
      z-index: 1000;
    }

    .social-btn .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.9);
    }

    .social-btn:hover .tooltip {
      opacity: 1;
    }

    .social-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }

    .social-btn.liked {
      background: #ff6b6b;
      color: #fff;
    }

    .product-modal, .comments-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: #fff;
      border-radius: 12px;
      max-width: 400px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .modal-body {
      padding: 20px;
    }

    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .product-details {
      margin-bottom: 20px;
    }

    .brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }

    .original-price {
      font-size: 0.9rem;
      color: #999;
      text-decoration: line-through;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-primary, .btn-secondary, .btn-outline {
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #007bff;
      color: #fff;
    }

    .btn-secondary {
      background: #6c757d;
      color: #fff;
    }

    .btn-outline {
      background: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .comments-list {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 16px;
    }

    .comment {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .comment-content {
      flex: 1;
    }

    .comment-username {
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }

    .comment-text {
      margin: 4px 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .comment-time {
      font-size: 0.8rem;
      color: #666;
    }

    .comment-input {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .comment-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .comment-input button {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: #007bff;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .comment-input button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Responsive Navigation Slider */
    @media (max-width: 768px) {
      .story-navigation {
        top: 60px;
        padding: 8px 0;
      }

      .nav-slider-container {
        padding: 0 12px;
        gap: 6px;
      }

      .nav-slider-btn {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
      }

      .story-thumbnails {
        gap: 6px;
      }

      .story-thumbnail {
        width: 40px;
        height: 40px;
      }

      .thumbnail-overlay {
        width: 16px;
        height: 16px;
      }
    }

    @media (max-width: 480px) {
      .story-navigation {
        top: 55px;
        padding: 6px 0;
      }

      .nav-slider-container {
        padding: 0 8px;
        gap: 4px;
      }

      .nav-slider-btn {
        width: 24px;
        height: 24px;
        font-size: 0.7rem;
      }

      .story-thumbnails {
        gap: 4px;
      }

      .story-thumbnail {
        width: 36px;
        height: 36px;
      }

      .thumbnail-overlay {
        width: 14px;
        height: 14px;
      }
    }

    /* Enhanced Responsive Design */
    @media (max-width: 768px) {
      .story-header {
        padding: 12px 16px;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
      }

      .username {
        font-size: 0.85rem;
      }

      .timestamp {
        font-size: 0.75rem;
      }

      .progress-container {
        padding: 0 16px;
        top: 6px;
      }

      .story-caption {
        bottom: 140px;
        left: 16px;
        right: 16px;
        font-size: 0.85rem;
        padding: 10px;
      }

      .story-actions {
        padding: 16px;
      }

      .ecommerce-actions {
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
      }

      .action-btn {
        padding: 14px;
        font-size: 1rem;
        min-height: 48px; /* Touch-friendly */
      }

      .action-btn .tooltip,
      .social-btn .tooltip {
        font-size: 0.7rem;
        padding: 4px 8px;
        margin-bottom: 6px;
      }

      .social-actions {
        gap: 20px;
      }

      .social-btn {
        width: 48px;
        height: 48px;
        font-size: 1.2rem;
      }

      .product-tag-icon {
        width: 28px;
        height: 28px;
        font-size: 0.9rem;
      }

      .product-tag-info {
        font-size: 0.75rem;
        padding: 6px 10px;
      }

      .modal-content {
        margin: 10px;
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
      }

      .modal-body {
        padding: 16px;
      }

      .product-image {
        height: 180px;
      }
    }

    @media (max-width: 480px) {
      .story-header {
        padding: 10px 12px;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
      }

      .username {
        font-size: 0.8rem;
      }

      .progress-container {
        padding: 0 12px;
        top: 4px;
      }

      .story-caption {
        bottom: 120px;
        left: 12px;
        right: 12px;
        font-size: 0.8rem;
        padding: 8px;
      }

      .story-actions {
        padding: 12px;
      }

      .ecommerce-actions {
        gap: 8px;
        margin-bottom: 16px;
      }

      .action-btn {
        padding: 12px;
        font-size: 0.9rem;
        min-height: 44px;
      }

      .social-actions {
        gap: 16px;
      }

      .social-btn {
        width: 44px;
        height: 44px;
        font-size: 1.1rem;
      }

      .action-btn .tooltip,
      .social-btn .tooltip {
        font-size: 0.65rem;
        padding: 3px 6px;
        margin-bottom: 4px;
      }
    }

    @media (min-width: 769px) {
      .stories-viewer {
        max-width: 400px;
        margin: 0 auto;
        border-radius: 12px;
        overflow: hidden;
        height: 90vh;
        top: 5vh;
      }

      .story-media {
        border-radius: 8px;
      }

      .ecommerce-actions {
        flex-direction: row;
        gap: 12px;
      }

      .action-btn {
        padding: 10px 16px;
        font-size: 0.9rem;
      }
    }

    @media (min-width: 1024px) {
      .stories-viewer {
        max-width: 450px;
        height: 85vh;
        top: 7.5vh;
      }
    }

    /* Touch and Gesture Improvements */
    .nav-area {
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }

    .stories-viewer * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Loading States */
    .story-media {
      transition: opacity 0.3s ease;
    }

    .story-media.loading {
      opacity: 0.5;
    }

    /* Accessibility Improvements */
    .btn-close:focus,
    .action-btn:focus,
    .social-btn:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }

    /* Performance Optimizations */
    .stories-viewer {
      will-change: transform;
      transform: translateZ(0);
    }

    .story-media {
      will-change: opacity;
    }

    .progress-fill {
      will-change: width;
    }
  `]
})
export class StoriesViewerComponent implements OnInit, OnDestroy {
  @ViewChild('storyVideo') storyVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('storyThumbnails') storyThumbnails!: ElementRef<HTMLDivElement>;

  stories: Story[] = [];
  currentIndex = 0;
  currentStory!: Story;
  isLiked = false;
  isMuted = true;
  isPaused = false;
  showProductTags = false;
  selectedProduct: any = null;
  showCommentsModal = false;
  comments: any[] = [];
  newComment = '';

  // Touch handling
  private touchStartTime = 0;
  private longPressTimer: any;

  // Navigation slider properties
  canScrollLeft = false;
  canScrollRight = false;

  private progressTimer: any;
  private storyDuration = 15000; // 15 seconds default

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Handle query parameters for story index
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['index']) {
        this.currentIndex = parseInt(queryParams['index'], 10) || 0;
      }
    });

    this.route.params.subscribe(params => {
      if (params['userId']) {
        this.loadUserStories(params['userId']);
      } else {
        this.loadStories();
      }
      if (params['storyId']) {
        this.jumpToStory(params['storyId']);
      }
    });

    // Add keyboard listeners for better UX
    this.addKeyboardListeners();
    this.addTouchListeners();

    // Initialize navigation slider after view init
    setTimeout(() => {
      this.updateScrollButtons();
      this.updateNavigationSlider();
    }, 100);
  }

  ngOnDestroy() {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  // Instagram-like interactions
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.storyVideo) {
      if (this.isPaused) {
        this.storyVideo.nativeElement.pause();
        clearTimeout(this.progressTimer);
      } else {
        this.storyVideo.nativeElement.play();
        this.startStoryTimer();
      }
    }
  }

  toggleProductTags() {
    this.showProductTags = !this.showProductTags;
    if (this.showProductTags) {
      setTimeout(() => {
        this.showProductTags = false;
      }, 3000);
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartTime = Date.now();
    this.longPressTimer = setTimeout(() => {
      this.isPaused = true;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.pause();
      }
      clearTimeout(this.progressTimer);
    }, 200);
  }

  onTouchEnd(event: TouchEvent) {
    clearTimeout(this.longPressTimer);
    if (this.isPaused && Date.now() - this.touchStartTime > 200) {
      this.isPaused = false;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.play();
      }
      this.startStoryTimer();
    }
  }

  onMouseDown(event: MouseEvent) {
    this.touchStartTime = Date.now();
    this.longPressTimer = setTimeout(() => {
      this.isPaused = true;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.pause();
      }
      clearTimeout(this.progressTimer);
    }, 200);
  }

  onMouseUp(event: MouseEvent) {
    clearTimeout(this.longPressTimer);
    if (this.isPaused && Date.now() - this.touchStartTime > 200) {
      this.isPaused = false;
      if (this.storyVideo) {
        this.storyVideo.nativeElement.play();
      }
      this.startStoryTimer();
    }
  }

  onMediaLoaded() {
    // Media loaded, start timer
    this.startStoryTimer();
  }

  getStoryDuration(story: Story): number {
    return story.media.type === 'video' ? story.media.duration : 15;
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
      case ' ':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStories();
        break;
    }
  }



  loadStories() {
    // Load stories from real API
    fetch('http://localhost:5000/api/stories')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.stories = data.stories.filter((story: any) => story.isActive);
          if (this.stories.length > 0) {
            // Use the index from query params or default to 0
            const startIndex = Math.min(this.currentIndex, this.stories.length - 1);
            this.currentIndex = startIndex;
            this.currentStory = this.stories[startIndex];
            this.startStoryTimer();
            // Initialize navigation slider
            setTimeout(() => {
              this.updateScrollButtons();
              this.updateNavigationSlider();
            }, 100);
          }
        }
      })
      .catch(error => {
        console.error('Error loading stories:', error);
        // Show error message to user
        alert('Failed to load stories. Please try again.');
      });
  }

  loadUserStories(userId: string) {
    // Load specific user's stories from real API
    fetch(`http://localhost:5000/api/stories/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.stories = data.stories.filter((story: any) => story.isActive);
          if (this.stories.length > 0) {
            this.currentStory = this.stories[0];
            this.startStoryTimer();
          }
        }
      })
      .catch(error => {
        console.error('Error loading user stories:', error);
      });
  }

  jumpToStory(storyId: string) {
    const index = this.stories.findIndex(s => s._id === storyId);
    if (index !== -1) {
      this.currentIndex = index;
      this.currentStory = this.stories[index];
      this.startStoryTimer();
    }
  }

  startStoryTimer() {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }
    
    const duration = this.currentStory.media.type === 'video' 
      ? this.currentStory.media.duration * 1000 
      : this.storyDuration;
    
    this.progressTimer = setTimeout(() => {
      this.nextStory();
    }, duration);
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.currentStory = this.stories[this.currentIndex];
      this.startStoryTimer();
      this.updateNavigationSlider();
    } else {
      this.closeStories();
    }
  }

  previousStory() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentStory = this.stories[this.currentIndex];
      this.startStoryTimer();
      this.updateNavigationSlider();
    }
  }

  jumpToStoryIndex(index: number) {
    if (index >= 0 && index < this.stories.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.currentStory = this.stories[index];
      this.startStoryTimer();
      this.updateNavigationSlider();
    }
  }

  handleStoryClick(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width * 0.3) {
      this.previousStory();
    } else if (clickX > width * 0.7) {
      this.nextStory();
    }
  }

  getProgressWidth(index: number): number {
    if (index < this.currentIndex) return 100;
    if (index > this.currentIndex) return 0;
    return 0; // Will be animated by CSS
  }

  // Navigation slider methods
  getStoryThumbnail(story: Story): string {
    if (story.media.type === 'video' && story.media.thumbnail) {
      return story.media.thumbnail;
    }
    return story.media.url;
  }

  getThumbnailProgress(index: number): number {
    if (index < this.currentIndex) return 100;
    if (index > this.currentIndex) return 0;
    if (index === this.currentIndex) {
      // Calculate current progress based on timer
      return 0; // Will be updated by progress animation
    }
    return 0;
  }

  scrollStoriesLeft() {
    if (this.storyThumbnails) {
      const container = this.storyThumbnails.nativeElement;
      container.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  scrollStoriesRight() {
    if (this.storyThumbnails) {
      const container = this.storyThumbnails.nativeElement;
      container.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  updateNavigationSlider() {
    if (this.storyThumbnails && this.stories.length > 5) {
      const container = this.storyThumbnails.nativeElement;
      const thumbnailWidth = 56; // 48px + 8px gap
      const containerWidth = container.clientWidth;
      const currentThumbnailPosition = this.currentIndex * thumbnailWidth;

      // Center the current thumbnail
      const scrollPosition = currentThumbnailPosition - (containerWidth / 2) + (thumbnailWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });

      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  updateScrollButtons() {
    if (this.storyThumbnails) {
      const container = this.storyThumbnails.nativeElement;
      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
    }
  }

  closeStories() {
    // Navigate back to the previous page or home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/social']);
    }
  }

  // E-commerce actions
  buyNow() {
    if (this.currentStory.products.length > 0) {
      const product = this.currentStory.products[0].product;
      this.router.navigate(['/checkout'], { 
        queryParams: { productId: product._id, source: 'story' } 
      });
    }
  }

  addToCart() {
    if (this.currentStory.products.length > 0) {
      const product = this.currentStory.products[0].product;
      // TODO: Add to cart via service
      console.log('Add to cart from story:', product);
    }
  }

  addToWishlist() {
    if (this.currentStory.products.length > 0) {
      const product = this.currentStory.products[0].product;
      // TODO: Add to wishlist via service
      console.log('Add to wishlist from story:', product);
    }
  }

  // Social actions
  toggleLike() {
    this.isLiked = !this.isLiked;
    // TODO: Like/unlike story via API
  }

  openComments() {
    this.showCommentsModal = true;
    this.loadComments();
  }

  closeComments() {
    this.showCommentsModal = false;
  }

  shareStory() {
    // TODO: Implement share functionality
    console.log('Share story:', this.currentStory);
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    if (this.storyVideo) {
      this.storyVideo.nativeElement.muted = this.isMuted;
    }
  }

  // Product modal
  showProductModal(product: any) {
    this.selectedProduct = product;
  }

  closeProductModal() {
    this.selectedProduct = null;
  }

  buyProductNow() {
    if (this.selectedProduct) {
      this.router.navigate(['/checkout'], { 
        queryParams: { productId: this.selectedProduct._id, source: 'story' } 
      });
    }
  }

  addProductToCart() {
    if (this.selectedProduct) {
      // TODO: Add to cart via service
      console.log('Add product to cart:', this.selectedProduct);
      this.closeProductModal();
    }
  }

  addProductToWishlist() {
    if (this.selectedProduct) {
      // TODO: Add to wishlist via service
      console.log('Add product to wishlist:', this.selectedProduct);
      this.closeProductModal();
    }
  }

  // Comments
  loadComments() {
    // Load comments from API
    this.comments = [];
  }

  addComment() {
    if (this.newComment.trim()) {
      // TODO: Add comment via API
      console.log('Add comment:', this.newComment);
      this.newComment = '';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }

  getProductName(): string {
    return this.currentStory?.products?.[0]?.product?.name || 'Product';
  }



  // Keyboard and touch event listeners
  addKeyboardListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        this.previousStory();
      } else if (event.key === 'ArrowRight') {
        this.nextStory();
      } else if (event.key === 'Escape') {
        this.closeStories();
      }
    });
  }

  addTouchListeners() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    });

    document.addEventListener('touchend', (event) => {
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.nextStory(); // Swipe left - next story
        } else {
          this.previousStory(); // Swipe right - previous story
        }
      }
      // Vertical swipe down to close
      else if (diffY < -100) {
        this.closeStories();
      }
    });
  }
}
