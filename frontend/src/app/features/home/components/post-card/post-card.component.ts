import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Post } from '../../../../core/models/post.model';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { MediaService, MediaItem } from '../../../../core/services/media.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <article class="post">
      <!-- Post Header -->
      <div class="post-header">
        <div class="user-info">
          <img
            [src]="getUserAvatarUrl(post.user.avatar)"
            [alt]="post.user.fullName"
            class="user-avatar"
            (error)="handleImageError($event, 'user')"
          >
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
      <div class="post-media" [class.video-container]="currentMedia.type === 'video'">
        <!-- Loading Placeholder -->
        <div *ngIf="!currentMedia" class="media-loading">
          <div class="loading-spinner"></div>
        </div>

        <!-- Image Media -->
        <img
          *ngIf="currentMedia?.type === 'image'"
          [src]="currentMedia.url"
          [alt]="currentMedia.alt"
          class="post-image"
          (error)="handleImageError($event)"
          (load)="onMediaLoadComplete()"
          (dblclick)="onDoubleTap()"
        >

        <!-- Video Media -->
        <video
          *ngIf="currentMedia?.type === 'video'"
          #videoPlayer
          class="post-video"
          [src]="currentMedia.url"
          [poster]="currentMedia.thumbnailUrl"
          [muted]="true"
          [loop]="true"
          playsinline
          (click)="toggleVideoPlay()"
          (dblclick)="onDoubleTap()"
          (loadeddata)="onMediaLoadComplete()"
          (error)="handleVideoError($event)"
        ></video>

        <!-- Video Controls Overlay -->
        <div *ngIf="currentMedia?.type === 'video'" class="video-controls" [class.visible]="showVideoControls">
          <button class="play-pause-btn" (click)="toggleVideoPlay()" [class.playing]="isVideoPlaying">
            <i [class]="isVideoPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
          <div class="video-info" *ngIf="currentMedia.duration">
            <span class="video-duration">{{ formatDuration(currentMedia.duration) }}</span>
          </div>
          <div class="video-progress" *ngIf="videoDuration > 0">
            <div class="progress-bar" [style.width.%]="videoProgress"></div>
          </div>
        </div>

        <!-- Media Navigation (for multiple media) -->
        <div *ngIf="mediaItems.length > 1" class="media-navigation">
          <button
            class="nav-btn prev-btn"
            (click)="previousMedia()"
            [disabled]="currentMediaIndex === 0"
            [attr.aria-label]="'Previous media'"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            class="nav-btn next-btn"
            (click)="nextMedia()"
            [disabled]="currentMediaIndex === mediaItems.length - 1"
            [attr.aria-label]="'Next media'"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- Media Indicators -->
          <div class="media-indicators">
            <span
              *ngFor="let media of mediaItems; let i = index"
              class="indicator"
              [class.active]="i === currentMediaIndex"
              [class.video]="media.type === 'video'"
              (click)="goToMedia(i)"
              [attr.aria-label]="'Go to media ' + (i + 1)"
            >
              <i *ngIf="media.type === 'video'" class="fas fa-play-circle"></i>
            </span>
          </div>
        </div>

        <!-- Double Tap Heart Animation -->
        <div class="heart-animation" [class.animate]="showHeartAnimation">
          <i class="fas fa-heart"></i>
        </div>

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
              <img
                [src]="getProductImageUrl(productTag.product.images[0].url || '')"
                [alt]="productTag.product.name"
                (error)="handleImageError($event, 'product')"
              >
              <div class="product-details">
                <h5>{{ productTag.product.name }}</h5>
                <p>₹{{ productTag.product.price | number }}</p>
                <div class="product-quick-actions">
                  <button class="quick-btn buy-btn" (click)="onBuyNow(productTag.product._id)" title="Buy Now">
                    <i class="fas fa-bolt"></i>
                  </button>
                  <button class="quick-btn cart-btn" (click)="addToCart(productTag.product._id)" title="Add to Cart">
                    <i class="fas fa-cart-plus"></i>
                  </button>
                  <button class="quick-btn wishlist-btn" (click)="addToWishlist(productTag.product._id)" title="Add to Wishlist">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
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
          <button class="action-btn" (click)="toggleComments()">
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

      <!-- E-commerce Actions -->
      <div class="ecommerce-actions" *ngIf="post.products.length > 0">
        <div class="products-showcase">
          <div *ngFor="let productTag of post.products" class="product-showcase">
            <img [src]="productTag.product.images[0].url" [alt]="productTag.product.name" class="product-thumb">
            <div class="product-info-inline">
              <h5>{{ productTag.product.name }}</h5>
              <p class="price">₹{{ productTag.product.price | number }}</p>
              <div class="product-actions">
                <button class="btn-wishlist" (click)="addToWishlist(productTag.product._id)" [class.active]="isInWishlist(productTag.product._id)">
                  <i [class]="isInWishlist(productTag.product._id) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <button class="btn-cart" (click)="addToCart(productTag.product._id)">
                  <i class="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
                <button class="btn-buy-now" (click)="buyNow(productTag.product._id)">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
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
      overflow: hidden;
      background: #f8f9fa;
    }

    .post-media.video-container {
      background: #000;
    }

    .media-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #f8f9fa;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e3e3e3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .post-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      cursor: pointer;
      transition: transform 0.1s ease;
    }

    .post-image:active {
      transform: scale(0.98);
    }

    .post-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      cursor: pointer;
      transition: transform 0.1s ease;
    }

    .post-video:active {
      transform: scale(0.98);
    }

    /* Video Controls */
    .video-controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .video-controls.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .post-media:hover .video-controls {
      opacity: 1;
      pointer-events: auto;
    }

    .video-info {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .video-duration {
      font-family: monospace;
    }

    .play-pause-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 20px;
      color: #333;
    }

    .play-pause-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .play-pause-btn.playing {
      background: rgba(0, 0, 0, 0.7);
      color: white;
    }

    .video-progress {
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      height: 3px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: #007bff;
      border-radius: 2px;
      transition: width 0.1s ease;
    }

    /* Media Navigation */
    .media-navigation {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      pointer-events: auto;
      opacity: 0;
    }

    .post-media:hover .nav-btn {
      opacity: 1;
    }

    .nav-btn:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: translateY(-50%) scale(1.1);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .prev-btn {
      left: 10px;
    }

    .next-btn {
      right: 10px;
    }

    .media-indicators {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      pointer-events: auto;
    }

    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .indicator.active {
      background: white;
      transform: scale(1.2);
    }

    .indicator.video {
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
    }

    .indicator.video i {
      font-size: 6px;
      color: #333;
    }

    .indicator.video.active i {
      color: white;
    }

    /* Heart Animation */
    .heart-animation {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
      z-index: 1000;
    }

    .heart-animation.animate {
      animation: heartPop 1s ease-out;
    }

    .heart-animation i {
      font-size: 80px;
      color: #e91e63;
      filter: drop-shadow(0 0 10px rgba(233, 30, 99, 0.5));
    }

    @keyframes heartPop {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
      }
      15% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
      }
      30% {
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .post-card {
        margin: 0 -1rem;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }

      .post-header {
        padding: 1rem;
      }

      .user-avatar {
        width: 35px;
        height: 35px;
      }

      .user-details h4 {
        font-size: 0.9rem;
      }

      .user-details span {
        font-size: 0.8rem;
      }

      .post-media {
        aspect-ratio: 4/5; /* More mobile-friendly aspect ratio */
      }

      .nav-btn {
        width: 35px;
        height: 35px;
        font-size: 14px;
      }

      .play-pause-btn {
        width: 50px;
        height: 50px;
        font-size: 18px;
      }

      .post-actions {
        padding: 0.75rem 1rem;
      }

      .action-btn {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
      }

      .post-content {
        padding: 0 1rem 1rem;
      }

      .likes-count {
        font-size: 0.9rem;
      }

      .post-caption {
        font-size: 0.9rem;
      }

      .comments-section {
        padding: 0 1rem 1rem;
      }

      .comment-input {
        padding: 0.75rem;
        font-size: 0.9rem;
      }

      .product-showcase {
        padding: 1rem;
      }

      .product-item {
        min-width: 140px;
      }

      .product-image {
        width: 60px;
        height: 60px;
      }

      .product-info h5 {
        font-size: 0.8rem;
      }

      .product-price {
        font-size: 0.8rem;
      }

      .product-actions {
        gap: 0.25rem;
      }

      .product-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.7rem;
      }
    }

    /* Touch-friendly interactions */
    @media (hover: none) and (pointer: coarse) {
      .nav-btn,
      .play-pause-btn,
      .action-btn,
      .product-btn {
        transform: none;
        transition: background-color 0.2s ease;
      }

      .nav-btn:active,
      .play-pause-btn:active,
      .action-btn:active,
      .product-btn:active {
        transform: scale(0.95);
      }

      .post-media:hover .nav-btn {
        opacity: 1;
      }

      .post-media:hover .video-controls {
        opacity: 1;
      }
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

    .product-quick-actions {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      justify-content: center;
    }

    .quick-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      transition: all 0.3s ease;
    }

    .quick-btn.buy-btn {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
    }

    .quick-btn.cart-btn {
      background: linear-gradient(135deg, #4834d4, #686de0);
      color: white;
    }

    .quick-btn.wishlist-btn {
      background: linear-gradient(135deg, #ff9ff3, #f368e0);
      color: white;
    }

    .quick-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

    .ecommerce-actions {
      border-top: 1px solid #efefef;
      padding: 16px;
      background: #fafafa;
    }

    .products-showcase {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-showcase {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .product-thumb {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-info-inline {
      flex: 1;
    }

    .product-info-inline h5 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #262626;
    }

    .product-info-inline .price {
      font-size: 16px;
      font-weight: 700;
      color: #e91e63;
      margin: 0 0 8px 0;
    }

    .product-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-wishlist {
      background: none;
      border: 1px solid #ddd;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #666;
    }

    .btn-wishlist:hover {
      border-color: #e91e63;
      color: #e91e63;
    }

    .btn-wishlist.active {
      background: #e91e63;
      border-color: #e91e63;
      color: white;
    }

    .btn-cart {
      background: #2196f3;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .btn-cart:hover {
      background: #1976d2;
    }

    .btn-buy-now {
      background: #ff9800;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-buy-now:hover {
      background: #f57c00;
    }

    @media (max-width: 768px) {
      .product-actions {
        flex-direction: column;
        gap: 6px;
        align-items: stretch;
      }

      .btn-cart,
      .btn-buy-now {
        justify-content: center;
      }
    }
  `]
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Output() liked = new EventEmitter<string>();
  @Output() commented = new EventEmitter<{ postId: string; comment: string }>();
  @Output() shared = new EventEmitter<string>();
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  isLiked = false;
  isSaved = false;
  likesCount = 0;
  newComment = '';
  showComments = false;
  wishlistItems: string[] = [];
  cartItems: string[] = [];

  // Media handling
  mediaItems: MediaItem[] = [];
  currentMediaIndex = 0;
  currentMedia!: MediaItem;

  // Video controls
  isVideoPlaying = false;
  videoDuration = 0;
  videoProgress = 0;
  showVideoControls = false;
  showHeartAnimation = false;
  private videoProgressInterval?: number;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private mediaService: MediaService
  ) {}

  ngOnInit() {
    this.likesCount = this.post.analytics.likes;
    this.loadWishlistItems();
    this.loadCartItems();
    this.initializeMedia();
  }

  initializeMedia() {
    // Process media items with enhanced video support and content matching
    const contentHint = this.post.caption || this.post.hashtags?.join(' ') || '';
    this.mediaItems = this.mediaService.enhanceWithSampleVideos(this.post.media || [], 2, contentHint);

    this.currentMediaIndex = 0;
    this.currentMedia = this.mediaItems[0] || {
      id: 'default',
      type: 'image',
      url: this.mediaService.getSafeImageUrl('', 'post'),
      alt: 'Default post image'
    };

    // Preload media for better performance
    this.preloadCurrentMedia();
  }

  private preloadCurrentMedia() {
    if (this.currentMedia) {
      this.mediaService.preloadMedia([this.currentMedia]).catch(error => {
        console.warn('Failed to preload media:', error);
      });
    }
  }

  loadWishlistItems() {
    // Load from localStorage for demo
    const saved = localStorage.getItem('wishlist');
    this.wishlistItems = saved ? JSON.parse(saved) : [];
  }

  loadCartItems() {
    // Load from localStorage for demo
    const saved = localStorage.getItem('cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
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

  toggleComments() {
    this.showComments = !this.showComments;
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

  // E-commerce methods
  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  addToWishlist(productId: string) {
    this.wishlistService.toggleWishlist(productId).subscribe({
      next: (response) => {
        if (this.isInWishlist(productId)) {
          this.showNotification('Removed from wishlist', 'info');
        } else {
          this.showNotification('Added to wishlist ❤️', 'success');
        }
      },
      error: (error) => {
        console.error('Wishlist error:', error);
        // Fallback to offline mode
        this.wishlistService.toggleWishlistOffline(this.getProductById(productId));
        this.showNotification(this.isInWishlist(productId) ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'success');
      }
    });
  }

  addToCart(productId: string) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Added to cart 🛒', 'success');
        }
      },
      error: (error: any) => {
        console.error('Cart error:', error);
        this.showNotification('Failed to add to cart', 'error');
      }
    });
  }

  buyNow(productId: string) {
    this.cartService.addToCart(productId, 1).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('Redirecting to checkout...', 'info');
          this.router.navigate(['/shop/checkout']);
        }
      },
      error: (error: any) => {
        console.error('Buy now error:', error);
        this.showNotification('Failed to process purchase', 'error');
      }
    });
  }

  private getProductById(productId: string): any {
    // Find product in post's products array
    const productTag = this.post.products.find(p => p.product._id === productId);
    return productTag ? productTag.product : null;
  }

  onBuyNow(productId: string) {
    this.buyNow(productId);
  }

  // Media handling methods
  getUserAvatarUrl(url: string): string {
    return this.mediaService.getSafeImageUrl(url, 'user');
  }

  getProductImageUrl(url: string): string {
    return this.mediaService.getSafeImageUrl(url, 'product');
  }

  handleImageError(event: Event, type: 'user' | 'product' | 'post' = 'post'): void {
    this.mediaService.handleImageError(event, type);
  }

  handleVideoError(event: Event): void {
    console.error('Video load error:', event);
    // Could implement fallback to thumbnail or different video
  }

  // Removed duplicate method - using onMediaLoadComplete instead

  // Video control methods
  toggleVideoPlay(): void {
    if (!this.videoPlayer?.nativeElement) return;

    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
      this.isVideoPlaying = true;
      this.startVideoProgress();
    } else {
      video.pause();
      this.isVideoPlaying = false;
      this.stopVideoProgress();
    }
  }

  private startVideoProgress(): void {
    if (this.videoProgressInterval) {
      clearInterval(this.videoProgressInterval);
    }

    this.videoProgressInterval = window.setInterval(() => {
      if (this.videoPlayer?.nativeElement) {
        const video = this.videoPlayer.nativeElement;
        this.videoDuration = video.duration || 0;
        this.videoProgress = this.videoDuration > 0 ? (video.currentTime / this.videoDuration) * 100 : 0;

        if (video.ended) {
          this.isVideoPlaying = false;
          this.stopVideoProgress();
        }
      }
    }, 100);
  }

  private stopVideoProgress(): void {
    if (this.videoProgressInterval) {
      clearInterval(this.videoProgressInterval);
      this.videoProgressInterval = undefined;
    }
  }

  // Media navigation methods with enhanced transitions
  nextMedia(): void {
    if (this.currentMediaIndex < this.mediaItems.length - 1) {
      this.currentMediaIndex++;
      this.currentMedia = this.mediaItems[this.currentMediaIndex];
      this.resetVideoState();
      this.preloadCurrentMedia();
      this.trackMediaView();
    }
  }

  previousMedia(): void {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
      this.currentMedia = this.mediaItems[this.currentMediaIndex];
      this.resetVideoState();
      this.preloadCurrentMedia();
      this.trackMediaView();
    }
  }

  goToMedia(index: number): void {
    if (index >= 0 && index < this.mediaItems.length) {
      this.currentMediaIndex = index;
      this.currentMedia = this.mediaItems[index];
      this.resetVideoState();
      this.preloadCurrentMedia();
      this.trackMediaView();
    }
  }

  private trackMediaView(): void {
    // Track media view for analytics
    console.log(`Viewing media ${this.currentMediaIndex + 1} of ${this.mediaItems.length}: ${this.currentMedia.type}`);
  }

  private resetVideoState(): void {
    this.isVideoPlaying = false;
    this.videoProgress = 0;
    this.stopVideoProgress();
  }

  ngOnDestroy(): void {
    this.stopVideoProgress();
  }

  // Instagram-like interactions
  onDoubleTap(): void {
    this.toggleLike();
    this.showHeartAnimation = true;
    setTimeout(() => {
      this.showHeartAnimation = false;
    }, 1000);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onMediaLoadComplete(): void {
    // Media loaded successfully
    if (this.currentMedia?.type === 'video') {
      this.showVideoControls = true;
      setTimeout(() => {
        this.showVideoControls = false;
      }, 3000);
    }
  }

  private showNotification(message: string, type: 'success' | 'info' | 'error') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }
}
