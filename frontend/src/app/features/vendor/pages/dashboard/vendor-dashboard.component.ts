import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-dashboard">
      <div class="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <p>Welcome back, {{ currentUser?.fullName }}!</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalProducts }}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalOrders }}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-rupee-sign"></i>
          </div>
          <div class="stat-content">
            <h3>₹{{ stats.totalRevenue | number:'1.0-0' }}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-images"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalPosts }}</h3>
            <p>Posts & Stories</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a routerLink="/vendor/products/create" class="action-card">
            <div class="action-icon">
              <i class="fas fa-plus"></i>
            </div>
            <div class="action-content">
              <h3>Add Product</h3>
              <p>Create a new product listing</p>
            </div>
          </a>

          <a routerLink="/vendor/posts/create" class="action-card">
            <div class="action-icon">
              <i class="fas fa-camera"></i>
            </div>
            <div class="action-content">
              <h3>Create Post</h3>
              <p>Share a new product post</p>
            </div>
          </a>

          <a routerLink="/vendor/stories/create" class="action-card">
            <div class="action-icon">
              <i class="fas fa-video"></i>
            </div>
            <div class="action-content">
              <h3>Add Story</h3>
              <p>Create a product story</p>
            </div>
          </a>

          <a routerLink="/vendor/orders" class="action-card">
            <div class="action-icon">
              <i class="fas fa-list"></i>
            </div>
            <div class="action-content">
              <h3>View Orders</h3>
              <p>Manage your orders</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of recentActivity">
            <div class="activity-icon">
              <i [class]="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="vendor-menu">
        <h2>Vendor Tools</h2>
        <div class="menu-grid">
          <a routerLink="/vendor/products" class="menu-item">
            <i class="fas fa-box"></i>
            <span>My Products</span>
          </a>
          <a routerLink="/vendor/posts" class="menu-item">
            <i class="fas fa-images"></i>
            <span>My Posts</span>
          </a>
          <a routerLink="/vendor/stories" class="menu-item">
            <i class="fas fa-play-circle"></i>
            <span>My Stories</span>
          </a>
          <a routerLink="/vendor/orders" class="menu-item">
            <i class="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </a>
          <a routerLink="/vendor/analytics" class="menu-item">
            <i class="fas fa-chart-bar"></i>
            <span>Analytics</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .dashboard-header {
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .dashboard-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      background: #007bff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .stat-content h3 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-content p {
      color: #666;
      font-size: 0.9rem;
    }

    .quick-actions, .recent-activity, .vendor-menu {
      margin-bottom: 40px;
    }

    .quick-actions h2, .recent-activity h2, .vendor-menu h2 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .action-card:hover {
      border-color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    }

    .action-icon {
      width: 50px;
      height: 50px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007bff;
      font-size: 1.2rem;
    }

    .action-content h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .action-content p {
      color: #666;
      font-size: 0.9rem;
    }

    .activity-list {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f5f5f5;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007bff;
    }

    .activity-content p {
      margin-bottom: 4px;
      font-weight: 500;
    }

    .activity-time {
      color: #666;
      font-size: 0.85rem;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .menu-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .menu-item:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .menu-item i {
      font-size: 1.5rem;
      color: #007bff;
    }

    .menu-item span {
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .menu-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class VendorDashboardComponent implements OnInit {
  currentUser: any = null;
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalPosts: 0
  };

  recentActivity = [
    {
      icon: 'fas fa-plus text-success',
      message: 'New product "Summer Dress" was added',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      icon: 'fas fa-shopping-cart text-primary',
      message: 'Order #12345 was placed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      icon: 'fas fa-camera text-info',
      message: 'New post was published',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
    this.loadStats();
  }

  loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadStats() {
    // Load stats from API
    this.stats = {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalPosts: 0
    };
  }
}
