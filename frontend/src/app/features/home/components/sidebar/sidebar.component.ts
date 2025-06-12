import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <!-- Suggested Users -->
      <div class="suggestions">
        <h3>Suggested for you</h3>
        <div *ngFor="let user of suggestedUsers" class="suggestion-item">
          <img [src]="user.avatar" [alt]="user.fullName">
          <div class="suggestion-info">
            <h5>{{ user.username }}</h5>
            <p>{{ user.followedBy }}</p>
          </div>
          <button class="follow-btn" (click)="followUser(user.id)">
            {{ user.isFollowing ? 'Following' : 'Follow' }}
          </button>
        </div>
      </div>

      <!-- Trending Products -->
      <div class="trending">
        <h3>Trending Products</h3>
        <div *ngFor="let product of trendingProducts" class="trending-item">
          <img [src]="product.images[0].url" [alt]="product.name">
          <div class="trending-info">
            <h5>{{ product.name }}</h5>
            <p>₹{{ product.price | number }} 
              <span class="original-price" *ngIf="product.originalPrice">
                ₹{{ product.originalPrice | number }}
              </span>
            </p>
            <div class="trending-stats">
              <span class="trending-badge">🔥 Trending</span>
              <span class="views">{{ product.analytics.views | number }}k views</span>
            </div>
          </div>
          <button class="quick-buy-btn" (click)="quickBuy(product._id)">
            Quick Buy
          </button>
        </div>
      </div>

      <!-- Top Fashion Influencers -->
      <div class="influencers">
        <h3>Top Fashion Influencers</h3>
        <div *ngFor="let influencer of topInfluencers" class="influencer-item">
          <img [src]="influencer.avatar" [alt]="influencer.fullName">
          <div class="influencer-info">
            <h5>{{ influencer.username }}</h5>
            <p>{{ formatFollowerCount(influencer.followersCount) }} followers</p>
            <div class="influencer-stats">
              <span class="posts-count">{{ influencer.postsCount }} posts</span>
              <span class="engagement">{{ influencer.engagement }}% engagement</span>
            </div>
          </div>
          <button class="follow-btn" (click)="followInfluencer(influencer.id)">
            {{ influencer.isFollowing ? 'Following' : 'Follow' }}
          </button>
        </div>
      </div>

      <!-- Shop by Category -->
      <div class="categories">
        <h3>Shop by Category</h3>
        <div class="category-grid">
          <div *ngFor="let category of categories" class="category-item" (click)="browseCategory(category.slug)">
            <img [src]="category.image" [alt]="category.name">
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: sticky;
      top: 80px;
      height: fit-content;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .suggestions,
    .trending,
    .influencers,
    .categories {
      background: #fff;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      padding: 16px;
    }

    .suggestions h3,
    .trending h3,
    .influencers h3,
    .categories h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #8e8e8e;
    }

    .suggestion-item,
    .influencer-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .suggestion-item img,
    .influencer-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .suggestion-info,
    .influencer-info {
      flex: 1;
    }

    .suggestion-info h5,
    .influencer-info h5 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .suggestion-info p {
      font-size: 12px;
      color: #8e8e8e;
    }

    .influencer-info p {
      font-size: 12px;
      color: #8e8e8e;
      margin-bottom: 4px;
    }

    .influencer-stats {
      display: flex;
      gap: 8px;
    }

    .influencer-stats span {
      font-size: 11px;
      color: #8e8e8e;
    }

    .follow-btn {
      background: var(--primary-color);
      color: #fff;
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .follow-btn:hover {
      background: #0084d6;
    }

    .trending-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .trending-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .trending-item img {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }

    .trending-info {
      flex: 1;
    }

    .trending-info h5 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .trending-info p {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .original-price {
      text-decoration: line-through;
      color: #8e8e8e;
      font-weight: 400;
      margin-left: 4px;
    }

    .trending-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .trending-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      background: #fef3c7;
      color: #92400e;
      width: fit-content;
    }

    .views {
      font-size: 11px;
      color: #8e8e8e;
    }

    .quick-buy-btn {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      align-self: flex-start;
    }

    .quick-buy-btn:hover {
      background: var(--primary-color);
      color: #fff;
      border-color: var(--primary-color);
    }

    .category-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-item:hover {
      background: #f8fafc;
      border-color: var(--primary-color);
    }

    .category-item img {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
      margin-bottom: 8px;
    }

    .category-item span {
      font-size: 12px;
      font-weight: 500;
      text-align: center;
    }

    @media (max-width: 1024px) {
      .sidebar {
        order: -1;
        position: static;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  suggestedUsers: any[] = [];
  trendingProducts: Product[] = [];
  topInfluencers: any[] = [];
  categories: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadSuggestedUsers();
    this.loadTrendingProducts();
    this.loadTopInfluencers();
    this.loadCategories();
  }

  loadSuggestedUsers() {
    // Load from API - empty for now
    this.suggestedUsers = [];
  }

  loadTrendingProducts() {
    // Load from API - empty for now
    this.trendingProducts = [];
  }

  loadTopInfluencers() {
    // Load from API - empty for now
    this.topInfluencers = [];
  }

  loadCategories() {
    this.categories = [
      {
        name: 'Women',
        slug: 'women',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100'
      },
      {
        name: 'Men',
        slug: 'men',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100'
      },
      {
        name: 'Kids',
        slug: 'children',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=100'
      },
      {
        name: 'Ethnic',
        slug: 'ethnic',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=100'
      }
    ];
  }

  formatFollowerCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  followUser(userId: string) {
    const user = this.suggestedUsers.find(u => u.id === userId);
    if (user) {
      user.isFollowing = !user.isFollowing;
    }
  }

  followInfluencer(influencerId: string) {
    const influencer = this.topInfluencers.find(i => i.id === influencerId);
    if (influencer) {
      influencer.isFollowing = !influencer.isFollowing;
    }
  }

  quickBuy(productId: string) {
    console.log('Quick buy product:', productId);
    // TODO: Implement quick buy functionality
  }

  browseCategory(categorySlug: string) {
    console.log('Browse category:', categorySlug);
    // TODO: Navigate to category page
  }
}
