import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  caption: string;
  media: {
    type: 'image' | 'video';
    url: string;
    alt: string;
  }[];
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
    size?: string;
    color?: string;
  }[];
  hashtags: string[];
  likes: { user: string; likedAt: Date }[];
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    text: string;
    commentedAt: Date;
  }[];
  shares: { user: string; sharedAt: Date }[];
  saves: { user: string; savedAt: Date }[];
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="social-feed">
      <!-- Stories Bar -->
      <div class="stories-bar">
        <div class="stories-container">
          <div class="story-item add-story" (click)="createStory()">
            <div class="story-avatar add-avatar">
              <i class="fas fa-plus"></i>
            </div>
            <span class="story-username">Your Story</span>
          </div>

          <div class="story-item"
               *ngFor="let story of stories; let i = index"
               (click)="openStoryViewer(i)">
            <div class="story-avatar" [class.viewed]="story.viewed">
              <img [src]="story.user.avatar || '/assets/images/default-avatar.png'"
                   [alt]="story.user.fullName">
            </div>
            <span class="story-username">{{ story.user.username }}</span>
          </div>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="posts-container">
        <div class="post-card" *ngFor="let post of posts">
          <!-- Post Header -->
          <div class="post-header">
            <div class="user-info">
              <img [src]="post.user.avatar || '/assets/images/default-avatar.png'"
                   [alt]="post.user.fullName"
                   class="user-avatar"
                   (click)="viewProfile(post.user._id)">
              <div class="user-details">
                <div class="username-row">
                  <span class="username" (click)="viewProfile(post.user._id)">{{ post.user.username }}</span>
                  <i class="fas fa-check-circle verified" *ngIf="post.user.isVerified"></i>
                </div>
                <span class="post-time">{{ getTimeAgo(post.createdAt) }}</span>
              </div>
            </div>

            <div class="post-menu">
              <button class="btn-menu" (click)="showPostMenu(post)">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
          </div>

          <!-- Post Media -->
          <div class="post-media" (click)="viewPost(post)" (dblclick)="toggleLike(post)">
            <div class="media-container" *ngFor="let media of post.media; let i = index">
              <img *ngIf="media.type === 'image'"
                   [src]="media.url"
                   [alt]="media.alt"
                   class="post-image">

              <video *ngIf="media.type === 'video'"
                     [src]="media.url"
                     class="post-video"
                     controls
                     [muted]="true">
              </video>
            </div>

            <!-- Product Tags -->
            <div class="product-tags" *ngIf="post.products.length > 0">
              <div class="product-tag"
                   *ngFor="let productTag of post.products"
                   [style.left.%]="productTag.position.x"
                   [style.top.%]="productTag.position.y"
                   (click)="showProductDetails(productTag.product)">
                <div class="product-tag-icon">
                  <i class="fas fa-shopping-bag"></i>
                </div>
              </div>
            </div>

            <!-- Media Navigation (for multiple images) -->
            <div class="media-nav" *ngIf="post.media.length > 1">
              <div class="nav-dots">
                <span class="dot"
                      *ngFor="let media of post.media; let i = index"
                      [class.active]="i === 0"></span>
              </div>
            </div>
          </div>

          <!-- Post Actions -->
          <div class="post-actions">
            <div class="primary-actions">
              <button class="action-btn like"
                      [class.liked]="post.isLiked"
                      (click)="toggleLike(post)">
                <i class="fas fa-heart"></i>
              </button>

              <button class="action-btn comment" (click)="focusComment(post._id)">
                <i class="fas fa-comment"></i>
              </button>

              <button class="action-btn share" (click)="sharePost(post)">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>

            <div class="secondary-actions">
              <button class="action-btn save"
                      [class.saved]="post.isSaved"
                      (click)="toggleSave(post)">
                <i class="fas fa-bookmark"></i>
              </button>
            </div>
          </div>

          <!-- Post Stats -->
          <div class="post-stats">
            <div class="likes-count" *ngIf="post.likes.length > 0">
              <strong>{{ post.likes.length | number }} likes</strong>
            </div>
          </div>

          <!-- Post Caption -->
          <div class="post-caption" (click)="viewPost(post)">
            <span class="username" (click)="viewProfile(post.user._id); $event.stopPropagation()">{{ post.user.username }}</span>
            <span class="caption-text">{{ post.caption }}</span>

            <div class="hashtags" *ngIf="post.hashtags.length > 0">
              <span class="hashtag"
                    *ngFor="let hashtag of post.hashtags"
                    (click)="searchHashtag(hashtag)">
                #{{ hashtag }}
              </span>
            </div>
          </div>

          <!-- E-commerce Actions -->
          <div class="ecommerce-actions" *ngIf="post.products.length > 0">
            <button class="ecom-btn buy-now" (click)="buyNow(post)">
              <i class="fas fa-bolt"></i>
              Buy Now
            </button>
            <button class="ecom-btn add-cart" (click)="addToCart(post)">
              <i class="fas fa-shopping-cart"></i>
              Add to Cart
            </button>
            <button class="ecom-btn wishlist" (click)="addToWishlist(post)">
              <i class="fas fa-heart"></i>
              Wishlist
            </button>
          </div>

          <!-- Comments Preview -->
          <div class="comments-preview" *ngIf="post.comments.length > 0">
            <div class="view-all-comments"
                 *ngIf="post.comments.length > 2"
                 (click)="viewAllComments(post)">
              View all {{ post.comments.length }} comments
            </div>

            <div class="comment"
                 *ngFor="let comment of post.comments.slice(-2)">
              <span class="comment-username">{{ comment.user.username }}</span>
              <span class="comment-text">{{ comment.text }}</span>
            </div>
          </div>

          <!-- Add Comment -->
          <div class="add-comment">
            <img [src]="currentUser?.avatar || '/assets/images/default-avatar.png'"
                 [alt]="currentUser?.fullName"
                 class="comment-avatar">
            <input type="text"
                   [id]="'comment-' + post._id"
                   [(ngModel)]="commentTexts[post._id]"
                   placeholder="Add a comment..."
                   (keyup.enter)="addComment(post)"
                   class="comment-input">
            <button class="btn-post-comment"
                    (click)="addComment(post)"
                    [disabled]="!commentTexts[post._id] || !commentTexts[post._id].trim()">
              Post
            </button>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div class="load-more" *ngIf="hasMorePosts">
        <button class="btn-load-more" (click)="loadMorePosts()" [disabled]="loading">
          <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
          {{ loading ? 'Loading...' : 'Load More Posts' }}
        </button>
      </div>
    </div>

    <!-- Product Details Modal -->
    <div class="product-modal" *ngIf="selectedProduct" (click)="closeProductModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedProduct.name }}</h3>
          <button class="btn-close" (click)="closeProductModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <img [src]="selectedProduct.images[0]?.url"
               [alt]="selectedProduct.name"
               class="product-image">

          <div class="product-info">
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
  `,
  styles: [`
    .social-feed {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 0 80px 0;
    }

    /* Stories Bar */
    .stories-bar {
      background: #fff;
      border-bottom: 1px solid #eee;
      padding: 16px 0;
      margin-bottom: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .stories-container {
      display: flex;
      gap: 16px;
      padding: 0 20px;
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
      gap: 8px;
      cursor: pointer;
      min-width: 70px;
    }

    .story-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #ff6b6b;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, #ff6b6b, #ffa726);
    }

    .story-avatar.viewed {
      border-color: #ccc;
      background: #ccc;
    }

    .story-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .add-avatar {
      background: #f8f9fa !important;
      border-color: #ddd !important;
      color: #666;
      font-size: 1.2rem;
    }

    .story-username {
      font-size: 0.8rem;
      color: #333;
      text-align: center;
      max-width: 70px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Post Cards */
    .posts-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .post-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
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
      cursor: pointer;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .username {
      font-weight: 600;
      color: #333;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .verified {
      color: #1da1f2;
      font-size: 0.8rem;
    }

    .post-time {
      font-size: 0.8rem;
      color: #666;
    }

    .btn-menu {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
    }

    .btn-menu:hover {
      background: #f8f9fa;
    }

    /* Post Media */
    .post-media {
      position: relative;
      background: #000;
      cursor: pointer;
    }

    .media-container {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .post-image, .post-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-tags {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    .media-nav {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
    }

    .nav-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
    }

    .dot.active {
      background: #fff;
    }

    /* Post Actions */
    .post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px 8px;
    }

    .primary-actions, .secondary-actions {
      display: flex;
      gap: 16px;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #333;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
      transform: scale(1.1);
    }

    .action-btn.liked {
      color: #ff6b6b;
      animation: heartBeat 0.6s ease;
    }

    .action-btn.saved {
      color: #333;
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    /* Post Stats */
    .post-stats {
      padding: 0 20px 8px;
    }

    .likes-count {
      font-size: 0.9rem;
      color: #333;
    }

    /* Post Caption */
    .post-caption {
      padding: 0 20px 12px;
      line-height: 1.4;
      cursor: pointer;
    }

    .caption-text {
      margin-left: 8px;
      color: #333;
    }

    .hashtags {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .hashtag {
      color: #1da1f2;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .hashtag:hover {
      text-decoration: underline;
    }

    /* E-commerce Actions */
    .ecommerce-actions {
      display: flex;
      gap: 8px;
      padding: 12px 20px;
      border-top: 1px solid #f0f0f0;
    }

    .ecom-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
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

    .ecom-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    /* Comments */
    .comments-preview {
      padding: 0 20px 12px;
    }

    .view-all-comments {
      color: #666;
      font-size: 0.9rem;
      cursor: pointer;
      margin-bottom: 8px;
    }

    .view-all-comments:hover {
      text-decoration: underline;
    }

    .comment {
      margin-bottom: 4px;
      font-size: 0.9rem;
      line-height: 1.3;
    }

    .comment-username {
      font-weight: 600;
      color: #333;
      margin-right: 8px;
    }

    .comment-text {
      color: #333;
    }

    /* Add Comment */
    .add-comment {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-top: 1px solid #f0f0f0;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .comment-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.9rem;
      padding: 8px 0;
    }

    .comment-input::placeholder {
      color: #999;
    }

    .btn-post-comment {
      background: none;
      border: none;
      color: #1da1f2;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 8px;
    }

    .btn-post-comment:disabled {
      color: #ccc;
      cursor: not-allowed;
    }

    /* Load More */
    .load-more {
      text-align: center;
      padding: 40px 20px;
    }

    .btn-load-more {
      background: #007bff;
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto;
    }

    .btn-load-more:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Product Modal */
    .product-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
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

    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #666;
      padding: 4px;
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

    .product-info {
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

    /* Responsive */
    @media (max-width: 768px) {
      .social-feed {
        padding: 0 0 60px 0;
      }

      .stories-bar {
        padding: 12px 0;
      }

      .stories-container {
        padding: 0 16px;
        gap: 12px;
      }

      .story-avatar {
        width: 50px;
        height: 50px;
      }

      .story-username {
        font-size: 0.75rem;
        max-width: 50px;
      }

      .post-header {
        padding: 12px 16px;
      }

      .post-actions {
        padding: 8px 16px 6px;
      }

      .post-stats, .post-caption, .comments-preview {
        padding-left: 16px;
        padding-right: 16px;
      }

      .ecommerce-actions {
        padding: 8px 16px;
        flex-direction: column;
        gap: 6px;
      }

      .ecom-btn {
        padding: 12px;
        font-size: 0.9rem;
      }

      .add-comment {
        padding: 8px 16px;
      }
    }
  `]
})
export class SocialFeedComponent implements OnInit {
  posts: Post[] = [];
  stories: any[] = [];
  commentTexts: { [key: string]: string } = {};
  selectedProduct: any = null;
  currentUser: any = null;
  loading = false;
  hasMorePosts = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadStories();
    this.loadPosts();
  }

  loadCurrentUser() {
    // TODO: Get current user from auth service
    this.currentUser = {
      _id: 'current-user',
      username: 'you',
      fullName: 'Your Name',
      avatar: ''
    };
  }

  loadStories() {
    // Load stories from real API
    fetch('http://localhost:5000/api/stories')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Group stories by user
          const userStories = data.stories.reduce((acc: any, story: any) => {
            const userId = story.user._id;
            if (!acc[userId]) {
              acc[userId] = {
                user: story.user,
                viewed: false, // TODO: Check if current user viewed this user's stories
                stories: []
              };
            }
            acc[userId].stories.push(story);
            return acc;
          }, {});

          this.stories = Object.values(userStories);
        }
      })
      .catch(error => {
        console.error('Error loading stories:', error);
      });
  }

  loadPosts() {
    this.loading = true;

    // Load posts from real API
    fetch('http://localhost:5000/api/posts')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.posts = data.posts.map((post: any) => ({
            ...post,
            isLiked: false, // TODO: Check if current user liked this post
            isSaved: false  // TODO: Check if current user saved this post
          }));
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading posts:', error);
        this.loading = false;
      });
  }

  loadMorePosts() {
    if (this.loading || !this.hasMorePosts) return;

    this.loading = true;
    const page = Math.floor(this.posts.length / 10) + 1;

    // Load more posts from real API
    fetch(`http://localhost:5000/api/posts?page=${page}&limit=10`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.posts.length > 0) {
          const newPosts = data.posts.map((post: any) => ({
            ...post,
            isLiked: false, // TODO: Check if current user liked this post
            isSaved: false  // TODO: Check if current user saved this post
          }));
          this.posts = [...this.posts, ...newPosts];

          // Check if there are more posts
          this.hasMorePosts = data.posts.length === 10;
        } else {
          this.hasMorePosts = false;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading more posts:', error);
        this.loading = false;
      });
  }

  // Stories actions
  createStory() {
    this.router.navigate(['/create-story']);
  }

  viewStory(userId: string) {
    // Navigate to stories viewer with user ID
    console.log('Navigating to user stories:', userId);
    this.router.navigate(['/stories', userId]);
  }

  viewStories() {
    // Navigate to general stories viewer
    console.log('Navigating to all stories');
    this.router.navigate(['/stories']);
  }

  openStoryViewer(storyIndex: number = 0) {
    // Open stories viewer starting from specific index
    console.log('Opening story viewer at index:', storyIndex);
    this.router.navigate(['/stories'], {
      queryParams: { index: storyIndex }
    });
  }

  // Post actions
  viewProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  showPostMenu(post: Post) {
    // TODO: Show post menu (report, share, etc.)
    console.log('Show menu for post:', post);
  }

  toggleLike(post: Post) {
    post.isLiked = !post.isLiked;

    if (post.isLiked) {
      post.likes.push({
        user: this.currentUser._id,
        likedAt: new Date()
      });
    } else {
      post.likes = post.likes.filter(like => like.user !== this.currentUser._id);
    }

    // TODO: Update like status via API
    console.log('Toggle like for post:', post._id, post.isLiked);
  }

  toggleSave(post: Post) {
    post.isSaved = !post.isSaved;

    if (post.isSaved) {
      post.saves.push({
        user: this.currentUser._id,
        savedAt: new Date()
      });
    } else {
      post.saves = post.saves.filter(save => save.user !== this.currentUser._id);
    }

    // TODO: Update save status via API
    console.log('Toggle save for post:', post._id, post.isSaved);
  }

  sharePost(post: Post) {
    // TODO: Implement share functionality
    console.log('Share post:', post);

    if (navigator.share) {
      navigator.share({
        title: `${post.user.username}'s post`,
        text: post.caption,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  focusComment(postId: string) {
    const commentInput = document.getElementById(`comment-${postId}`) as HTMLInputElement;
    if (commentInput) {
      commentInput.focus();
    }
  }

  addComment(post: Post) {
    const commentText = this.commentTexts[post._id];
    if (!commentText?.trim()) return;

    const newComment = {
      _id: Date.now().toString(),
      user: {
        _id: this.currentUser._id,
        username: this.currentUser.username,
        fullName: this.currentUser.fullName,
        avatar: this.currentUser.avatar
      },
      text: commentText.trim(),
      commentedAt: new Date()
    };

    post.comments.push(newComment);
    this.commentTexts[post._id] = '';

    // TODO: Add comment via API
    console.log('Add comment to post:', post._id, newComment);
  }

  viewAllComments(post: Post) {
    this.router.navigate(['/post', post._id, 'comments']);
  }

  viewPost(post: Post) {
    // Navigate to post detail view
    this.router.navigate(['/post', post._id]);
  }

  viewPostDetail(postId: string) {
    // Navigate to post detail view by ID
    this.router.navigate(['/post', postId]);
  }

  searchHashtag(hashtag: string) {
    this.router.navigate(['/search'], { queryParams: { hashtag } });
  }

  // E-commerce actions
  buyNow(post: Post) {
    if (post.products.length > 0) {
      const product = post.products[0].product;
      this.router.navigate(['/checkout'], {
        queryParams: { productId: product._id, source: 'post' }
      });
    }
  }

  addToCart(post: Post) {
    if (post.products.length > 0) {
      const product = post.products[0].product;
      // TODO: Add to cart via service
      console.log('Add to cart from post:', product);
      alert(`${product.name} added to cart!`);
    }
  }

  addToWishlist(post: Post) {
    if (post.products.length > 0) {
      const product = post.products[0].product;
      // TODO: Add to wishlist via service
      console.log('Add to wishlist from post:', product);
      alert(`${product.name} added to wishlist!`);
    }
  }

  // Product modal
  showProductDetails(product: any) {
    this.selectedProduct = product;
  }

  closeProductModal() {
    this.selectedProduct = null;
  }

  buyProductNow() {
    if (this.selectedProduct) {
      this.router.navigate(['/checkout'], {
        queryParams: { productId: this.selectedProduct._id, source: 'post' }
      });
    }
  }

  addProductToCart() {
    if (this.selectedProduct) {
      // TODO: Add to cart via service
      console.log('Add product to cart:', this.selectedProduct);
      alert(`${this.selectedProduct.name} added to cart!`);
      this.closeProductModal();
    }
  }

  addProductToWishlist() {
    if (this.selectedProduct) {
      // TODO: Add to wishlist via service
      console.log('Add product to wishlist:', this.selectedProduct);
      alert(`${this.selectedProduct.name} added to wishlist!`);
      this.closeProductModal();
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(date).toLocaleDateString();
  }


}