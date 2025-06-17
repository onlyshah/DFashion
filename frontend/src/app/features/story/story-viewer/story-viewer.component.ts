import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { Story } from '../../../core/models/story.model';
import { StoryService } from '../../../core/services/story.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { MediaService, MediaItem } from '../../../core/services/media.service';

@Component({
  selector: 'app-story-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="story-viewer" *ngIf="currentStory" (click)="onStoryClick($event)">
      <!-- Progress Bars -->
      <div class="progress-container">
        <div 
          *ngFor="let story of userStories; let i = index" 
          class="progress-bar"
        >
          <div 
            class="progress-fill"
            [style.width.%]="getProgressWidth(i)"
            [class.active]="i === currentStoryIndex"
            [class.completed]="i < currentStoryIndex"
          ></div>
        </div>
      </div>

      <!-- Story Header -->
      <div class="story-header">
        <div class="user-info">
          <img [src]="currentStory.user.avatar" [alt]="currentStory.user.fullName" class="user-avatar">
          <div class="user-details">
            <span class="username">{{ currentStory.user.username }}</span>
            <span class="time-ago">{{ getTimeAgo(currentStory.createdAt) }}</span>
          </div>
        </div>
        <div class="story-actions">
          <button class="action-btn" (click)="pauseStory()" *ngIf="!isPaused">
            <i class="fas fa-pause"></i>
          </button>
          <button class="action-btn" (click)="resumeStory()" *ngIf="isPaused">
            <i class="fas fa-play"></i>
          </button>
          <button class="action-btn" (click)="closeStory()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Story Content -->
      <div class="story-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="story-loading">
          <div class="loading-spinner"></div>
        </div>

        <!-- Image Story -->
        <img
          *ngIf="currentMediaItem?.type === 'image' && !isLoading"
          [src]="currentMediaItem?.url || ''"
          [alt]="currentMediaItem?.alt || currentStory.caption || ''"
          class="story-media"
          (load)="onMediaLoaded()"
          (error)="handleImageError($event)"
          (click)="onStoryTap($event)"
        >

        <!-- Video Story -->
        <video
          *ngIf="currentMediaItem?.type === 'video' && !isLoading"
          [src]="currentMediaItem?.url || ''"
          [poster]="currentMediaItem?.thumbnailUrl || ''"
          class="story-media"
          autoplay
          muted
          playsinline
          (loadeddata)="onMediaLoaded()"
          (ended)="nextStory()"
          (error)="handleVideoError($event)"
          (click)="onStoryTap($event)"
          #videoElement
        ></video>

        <!-- Video Duration Indicator -->
        <div *ngIf="currentMediaItem?.type === 'video' && currentMediaItem?.duration" class="video-duration">
          {{ formatDuration(currentMediaItem?.duration || 0) }}
        </div>

        <!-- Video Controls for Stories -->
        <div *ngIf="currentMediaItem?.type === 'video'" class="video-story-controls">
          <button class="video-play-btn" (click)="toggleStoryVideo()" [class.playing]="isStoryVideoPlaying">
            <i [class]="isStoryVideoPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
        </div>

        <!-- Story Caption -->
        <div class="story-caption" *ngIf="currentStory.caption">
          <p>{{ currentStory.caption }}</p>
        </div>

        <!-- Product Tags -->
        <div class="product-tags" *ngIf="currentStory.products.length > 0">
          <div 
            *ngFor="let productTag of currentStory.products" 
            class="product-tag"
            [style.top.%]="productTag.position.y"
            [style.left.%]="productTag.position.x"
            (click)="showProductDetails(productTag)"
          >
            <div class="tag-dot"></div>
          </div>
        </div>
      </div>

      <!-- Navigation Areas -->
      <div class="nav-area nav-left" (click)="previousStory()"></div>
      <div class="nav-area nav-right" (click)="nextStory()"></div>

      <!-- Story Action Buttons -->
      <div class="story-action-buttons" *ngIf="currentStory.products.length > 0">
        <button class="action-button buy-now-btn" (click)="buyNowFromStory()" [attr.data-tooltip]="'Buy Now'">
          <i class="fas fa-shopping-bag"></i>
          <span>Buy Now</span>
        </button>
        <button class="action-button wishlist-btn" (click)="addToWishlistFromStory()" [attr.data-tooltip]="'Add to Wishlist'">
          <i class="fas fa-heart"></i>
          <span>Wishlist</span>
        </button>
        <button class="action-button cart-btn" (click)="addToCartFromStory()" [attr.data-tooltip]="'Add to Cart'">
          <i class="fas fa-shopping-cart"></i>
          <span>Add to Cart</span>
        </button>
      </div>

      <!-- Story Footer -->
      <div class="story-footer">
        <div class="story-input">
          <input
            type="text"
            placeholder="Send message"
            [(ngModel)]="messageText"
            (keyup.enter)="sendMessage()"
            class="message-input"
          >
          <button class="send-btn" (click)="sendMessage()" *ngIf="messageText.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="story-reactions">
          <button class="reaction-btn" (click)="likeStory()">
            <i class="far fa-heart"></i>
          </button>
          <button class="reaction-btn" (click)="shareStory()">
            <i class="far fa-share"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="product-modal" *ngIf="selectedProduct" (click)="closeProductModal()">
      <div class="product-modal-content" (click)="$event.stopPropagation()">
        <div class="product-header">
          <img [src]="selectedProduct.product.images[0].url" [alt]="selectedProduct.product.name" class="product-image">
          <div class="product-info">
            <h3>{{ selectedProduct.product.name }}</h3>
            <p class="product-price">₹{{ selectedProduct.product.price | number }}</p>
            <p class="product-brand">{{ selectedProduct.product.brand }}</p>
          </div>
        </div>
        <div class="product-actions">
          <button class="btn-wishlist" (click)="addToWishlist(selectedProduct.product._id)">
            <i class="far fa-heart"></i>
            Wishlist
          </button>
          <button class="btn-cart" (click)="addToCart(selectedProduct.product._id)">
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
          <button class="btn-buy-now" (click)="buyNow(selectedProduct.product._id)">
            Buy Now
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="isLoading">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .story-viewer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    .progress-container {
      display: flex;
      gap: 2px;
      padding: 8px 16px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
    }

    .progress-bar {
      flex: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 1px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: white;
      transition: width 0.1s linear;
      border-radius: 1px;
    }

    .progress-fill.completed {
      width: 100% !important;
    }

    .story-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
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
      border: 2px solid white;
      object-fit: cover;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .time-ago {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
    }

    .story-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    .story-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .story-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .story-media {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      cursor: pointer;
      user-select: none;
      transition: transform 0.1s ease;
    }

    .story-media:active {
      transform: scale(0.98);
    }

    .video-duration {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      font-family: monospace;
      z-index: 10;
    }

    /* Video Story Controls */
    .video-story-controls {
      position: absolute;
      bottom: 100px;
      right: 20px;
      z-index: 1000;
    }

    .video-play-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      color: #333;
      backdrop-filter: blur(10px);
    }

    .video-play-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .video-play-btn.playing {
      background: rgba(0, 0, 0, 0.7);
      color: white;
    }

    .story-caption {
      position: absolute;
      bottom: 100px;
      left: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 12px 16px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .story-caption p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
    }

    .product-tags {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .product-tag {
      position: absolute;
      pointer-events: all;
      cursor: pointer;
    }

    .tag-dot {
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      border: 2px solid #007bff;
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
      background: #007bff;
      border-radius: 50%;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
    }

    .nav-area {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 30%;
      z-index: 5;
      cursor: pointer;
    }

    .nav-left {
      left: 0;
    }

    .nav-right {
      right: 0;
    }

    .story-action-buttons {
      position: absolute;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 10;
      padding: 0 16px;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 25px;
      color: #333;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      position: relative;
      min-width: 120px;
      justify-content: center;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .action-button:active {
      transform: translateY(0);
    }

    .buy-now-btn {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
    }

    .buy-now-btn:hover {
      background: linear-gradient(135deg, #ee5a24, #d63031);
    }

    .wishlist-btn {
      background: linear-gradient(135deg, #fd79a8, #e84393);
      color: white;
    }

    .wishlist-btn:hover {
      background: linear-gradient(135deg, #e84393, #d63384);
    }

    .cart-btn {
      background: linear-gradient(135deg, #00b894, #00a085);
      color: white;
    }

    .cart-btn:hover {
      background: linear-gradient(135deg, #00a085, #008f7a);
    }

    .action-button i {
      font-size: 16px;
    }

    .action-button span {
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* Tooltip styles */
    .action-button[data-tooltip]:hover::before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      margin-bottom: 8px;
      z-index: 1000;
    }

    .story-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
    }

    .story-input {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 12px 16px;
      color: white;
      font-size: 14px;
    }

    .message-input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .message-input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #007bff;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .story-reactions {
      display: flex;
      gap: 8px;
    }

    .reaction-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .product-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .product-modal-content {
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      animation: modalSlideUp 0.3s ease;
    }

    @keyframes modalSlideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .product-header {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
    }

    .product-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .product-price {
      font-size: 20px;
      font-weight: 700;
      color: #e91e63;
      margin: 0 0 4px 0;
    }

    .product-brand {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .product-actions {
      display: flex;
      gap: 8px;
    }

    .btn-wishlist, .btn-cart, .btn-buy-now {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12px;
    }

    .btn-wishlist {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-cart {
      background: #2196f3;
      color: white;
    }

    .btn-buy-now {
      background: #ff9800;
      color: white;
    }

    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .story-viewer {
        padding: 0;
      }

      .story-container {
        max-width: 100vw;
        height: 100vh;
        border-radius: 0;
      }

      .progress-bars {
        padding: 1rem 1rem 0.5rem;
      }

      .progress-bar {
        height: 2px;
      }

      .story-header {
        padding: 0.75rem 1rem;
      }

      .user-avatar {
        width: 35px;
        height: 35px;
      }

      .user-info h3 {
        font-size: 0.9rem;
      }

      .user-info span {
        font-size: 0.8rem;
      }

      .header-actions {
        gap: 1rem;
      }

      .header-btn {
        width: 35px;
        height: 35px;
        font-size: 1rem;
      }

      .story-content {
        height: calc(100vh - 140px);
      }

      .story-footer {
        padding: 1rem;
      }

      .message-input {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
      }

      .footer-actions {
        gap: 1rem;
      }

      .footer-btn {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
      }

      .nav-area {
        width: 40%;
      }

      .product-tag {
        transform: scale(0.9);
      }

      .product-info {
        width: 280px;
        padding: 1rem;
      }

      .product-image {
        width: 60px;
        height: 60px;
      }

      .product-details h5 {
        font-size: 0.9rem;
      }

      .product-details p {
        font-size: 0.8rem;
      }

      .product-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .product-btn {
        padding: 0.6rem 1rem;
        font-size: 0.8rem;
      }

      .video-story-controls {
        bottom: 120px;
        right: 15px;
      }

      .video-play-btn {
        width: 45px;
        height: 45px;
        font-size: 14px;
      }

      /* Product Modal Mobile */
      .product-modal {
        padding: 1rem;
        max-width: 90vw;
        max-height: 80vh;
      }

      .modal-content {
        padding: 1rem;
      }

      .modal-header h4 {
        font-size: 1.1rem;
      }

      .modal-body {
        padding: 1rem 0;
      }

      .modal-footer {
        flex-direction: column;
        gap: 0.75rem;
      }

      .modal-footer .product-btn {
        width: 100%;
        justify-content: center;
      }
    }

    /* Touch-friendly interactions for mobile */
    @media (hover: none) and (pointer: coarse) {
      .header-btn,
      .footer-btn,
      .product-btn,
      .video-play-btn {
        transform: none;
        transition: background-color 0.2s ease;
      }

      .header-btn:active,
      .footer-btn:active,
      .product-btn:active,
      .video-play-btn:active {
        transform: scale(0.95);
      }

      .product-tag:active {
        transform: scale(0.85);
      }

      /* Always show video controls on touch devices */
      .video-story-controls {
        opacity: 0.8;
      }

      .video-play-btn {
        background: rgba(255, 255, 255, 0.95);
      }
    }

    /* Landscape mobile orientation */
    @media (max-width: 768px) and (orientation: landscape) {
      .story-container {
        max-width: 100vh;
        margin: 0 auto;
      }

      .story-content {
        height: calc(100vh - 100px);
      }

      .story-header,
      .story-footer {
        padding: 0.5rem 1rem;
      }

      .progress-bars {
        padding: 0.5rem 1rem 0.25rem;
      }
    }
  `]
})
export class StoryViewerComponent implements OnInit, OnDestroy {
  userStories: Story[] = [];
  currentStoryIndex = 0;
  currentStory: Story | null = null;

  isLoading = true;
  isPaused = false;
  progress = 0;
  storyDuration = 5000; // 5 seconds for images

  messageText = '';
  selectedProduct: any = null;

  // Media handling
  currentMediaItem: MediaItem | null = null;
  isStoryVideoPlaying = false;

  private progressSubscription?: Subscription;
  private storyTimeout?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storyService: StoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['userId'];
      const storyIndex = parseInt(params['storyIndex']) || 0;
      
      if (userId) {
        this.loadUserStories(userId, storyIndex);
      }
    });
  }

  ngOnDestroy() {
    this.stopProgress();
    if (this.storyTimeout) {
      clearTimeout(this.storyTimeout);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
      case ' ':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStory();
        break;
    }
  }

  loadUserStories(userId: string, startIndex: number = 0) {
    this.isLoading = true;

    this.storyService.getUserStories(userId).subscribe({
      next: (response) => {
        this.userStories = response.stories;

        // Enhance stories with video content if needed
        this.userStories = this.enhanceStoriesWithMedia(this.userStories);

        this.currentStoryIndex = Math.min(startIndex, this.userStories.length - 1);
        this.currentStory = this.userStories[this.currentStoryIndex];
        this.updateCurrentMedia();
        this.isLoading = false;
        this.startStoryProgress();
      },
      error: (error) => {
        console.error('Failed to load stories:', error);
        this.isLoading = false;
        this.closeStory();
      }
    });
  }

  enhanceStoriesWithMedia(stories: Story[]): Story[] {
    return stories.map((story) => {
      // If story doesn't have media or has broken media, use fallback
      if (!story.media || !story.media.url || this.isBrokenMediaUrl(story.media.url)) {
        story.media = {
          type: 'image',
          url: this.mediaService.getReliableFallback('story'),
          thumbnail: this.mediaService.getReliableFallback('story'),
          duration: 30
        };
      }

      // Fix broken image URLs
      if (story.media && story.media.type === 'image' && this.isBrokenMediaUrl(story.media.url)) {
        story.media = {
          ...story.media,
          url: this.mediaService.getSafeImageUrl(story.media.url, 'story'),
          thumbnail: this.mediaService.getSafeImageUrl(story.media.thumbnail, 'story')
        };
      }

      return story;
    });
  }

  private isBrokenMediaUrl(url: string): boolean {
    return url.includes('/uploads/') || url.includes('sample-videos.com') || url.includes('localhost');
  }



  updateCurrentMedia() {
    if (this.currentStory?.media) {
      this.currentMediaItem = {
        id: this.currentStory._id,
        type: this.currentStory.media.type,
        url: this.mediaService.getSafeImageUrl(this.currentStory.media.url, 'story'),
        thumbnailUrl: this.currentStory.media.thumbnail,
        alt: this.currentStory.caption,
        duration: this.currentStory.media.duration
      };
    }
  }

  startStoryProgress() {
    this.stopProgress();
    this.progress = 0;
    
    if (this.currentStory?.media.type === 'video') {
      // For videos, let the video control the progress
      return;
    }
    
    const intervalMs = 50; // Update every 50ms
    const increment = (intervalMs / this.storyDuration) * 100;

    this.progressSubscription = timer(0, intervalMs).subscribe(() => {
      if (!this.isPaused) {
        this.progress += increment;
        if (this.progress >= 100) {
          this.nextStory();
        }
      }
    });
  }

  stopProgress() {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
      this.progressSubscription = undefined;
    }
  }

  getProgressWidth(index: number): number {
    if (index < this.currentStoryIndex) {
      return 100;
    } else if (index === this.currentStoryIndex) {
      return this.progress;
    } else {
      return 0;
    }
  }

  nextStory() {
    if (this.currentStoryIndex < this.userStories.length - 1) {
      this.currentStoryIndex++;
      this.currentStory = this.userStories[this.currentStoryIndex];
      this.updateCurrentMedia();
      this.startStoryProgress();
    } else {
      // Move to next user's stories or close
      this.closeStory();
    }
  }

  previousStory() {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.currentStory = this.userStories[this.currentStoryIndex];
      this.updateCurrentMedia();
      this.startStoryProgress();
    }
  }

  pauseStory() {
    this.isPaused = true;
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.pause();
    }
  }

  resumeStory() {
    this.isPaused = false;
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.play();
    }
  }

  onStoryClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Don't handle clicks on interactive elements
    if (target.closest('.story-header') || 
        target.closest('.story-footer') || 
        target.closest('.product-tag') ||
        target.closest('.nav-area')) {
      return;
    }
    
    // Pause/resume on tap
    if (this.isPaused) {
      this.resumeStory();
    } else {
      this.pauseStory();
    }
  }

  onMediaLoaded() {
    // Media is loaded, story can start
    if (this.currentMediaItem?.type === 'video') {
      this.isStoryVideoPlaying = true;
    }
  }

  handleImageError(event: Event): void {
    this.mediaService.handleImageError(event, 'story');
  }

  handleVideoError(event: Event): void {
    console.error('Story video error:', event);
    // Continue to next story on video error
    this.nextStory();
  }

  toggleStoryVideo(): void {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        this.isStoryVideoPlaying = true;
        this.resumeStory();
      } else {
        videoElement.pause();
        this.isStoryVideoPlaying = false;
        this.pauseStory();
      }
    }
  }

  showProductDetails(productTag: any) {
    this.selectedProduct = productTag;
    this.pauseStory();
  }

  closeProductModal() {
    this.selectedProduct = null;
    this.resumeStory();
  }

  addToWishlist(productId: string) {
    if (this.selectedProduct) {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.showNotification('Added to wishlist ❤️');
          this.closeProductModal();
        },
        error: (error) => {
          console.error('Wishlist error:', error);
          // Fallback to offline mode
          this.wishlistService.addToWishlistOffline(this.selectedProduct.product);
          this.showNotification('Added to wishlist ❤️');
          this.closeProductModal();
        }
      });
    }
  }

  addToCart(productId: string) {
    if (this.selectedProduct) {
      this.cartService.addToCart(productId, 1, this.selectedProduct.size, this.selectedProduct.color).subscribe({
        next: () => {
          this.showNotification('Added to cart 🛒');
          this.closeProductModal();
        },
        error: (error: any) => {
          console.error('Cart error:', error);
          this.showNotification('Added to cart 🛒');
          this.closeProductModal();
        }
      });
    }
  }

  buyNow(productId: string) {
    if (this.selectedProduct) {
      this.cartService.addToCart(productId, 1, this.selectedProduct.size, this.selectedProduct.color).subscribe({
        next: () => {
          this.showNotification('Redirecting to checkout...');
          this.closeProductModal();
          this.router.navigate(['/shop/checkout']);
        },
        error: (error: any) => {
          console.error('Buy now error:', error);
          this.showNotification('Redirecting to product page...');
          this.closeProductModal();
          this.router.navigate(['/product', productId]);
        }
      });
    }
  }

  private showNotification(message: string) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 20px;
      z-index: 30000;
      font-size: 14px;
      backdrop-filter: blur(10px);
      animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  sendMessage() {
    if (this.messageText.trim()) {
      console.log('Send message:', this.messageText);
      this.messageText = '';
    }
  }

  likeStory() {
    console.log('Like story');
  }

  shareStory() {
    console.log('Share story');
  }

  // Story action button methods
  buyNowFromStory() {
    if (this.currentStory.products.length > 0) {
      const firstProduct = this.currentStory.products[0].product;
      this.pauseStory();
      this.cartService.addToCart(firstProduct._id, 1).subscribe({
        next: () => {
          this.showNotification('Redirecting to checkout...');
          this.router.navigate(['/shop/checkout']);
        },
        error: (error: any) => {
          console.error('Buy now error:', error);
          this.showNotification('Redirecting to product page...');
          this.router.navigate(['/product', firstProduct._id]);
        }
      });
    }
  }

  addToWishlistFromStory() {
    if (this.currentStory.products.length > 0) {
      const firstProduct = this.currentStory.products[0].product;
      this.wishlistService.addToWishlist(firstProduct._id).subscribe({
        next: () => {
          this.showNotification('Added to wishlist ❤️');
        },
        error: (error) => {
          console.error('Wishlist error:', error);
          this.showNotification('Added to wishlist ❤️');
        }
      });
    }
  }

  addToCartFromStory() {
    if (this.currentStory.products.length > 0) {
      const firstProduct = this.currentStory.products[0].product;
      this.cartService.addToCart(firstProduct._id, 1).subscribe({
        next: () => {
          this.showNotification('Added to cart 🛒');
        },
        error: (error: any) => {
          console.error('Cart error:', error);
          this.showNotification('Added to cart 🛒');
        }
      });
    }
  }

  closeStory() {
    this.router.navigate(['/']);
  }

  onStoryTap(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const tapX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    if (tapX < centerX) {
      // Tapped left side - previous story
      this.previousStory();
    } else {
      // Tapped right side - next story
      this.nextStory();
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
}
