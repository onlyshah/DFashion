import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <a routerLink="/home">
              <h1 class="gradient-text">DFashion</h1>
            </a>
          </div>

          <!-- Search Bar -->
          <div class="search-bar" (click)="openSearch()">
            <i class="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search for fashion, brands, and more..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              (click)="openSearch()"
              readonly
            >
          </div>

          <!-- Navigation -->
          <nav class="nav-menu">
            <a routerLink="/home" routerLinkActive="active" class="nav-item">
              <i class="fas fa-home"></i>
              <span>Home</span>
            </a>
            <a routerLink="/shop" routerLinkActive="active" class="nav-item">
              <i class="fas fa-compass"></i>
              <span>Explore</span>
            </a>
            <a routerLink="/shop" routerLinkActive="active" class="nav-item">
              <i class="fas fa-shopping-bag"></i>
              <span>Shop</span>
            </a>
            <a routerLink="/wishlist" routerLinkActive="active" class="nav-item">
              <i class="fas fa-heart"></i>
              <span>Wishlist</span>
            </a>
            <a routerLink="/cart" routerLinkActive="active" class="nav-item cart-item">
              <i class="fas fa-shopping-cart"></i>
              <span>Cart</span>
              <span class="cart-badge" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
            </a>

            <!-- User Menu for logged in users -->
            <div *ngIf="currentUser" class="user-menu" (click)="toggleUserMenu()">
              <img [src]="currentUser.avatar" [alt]="currentUser.fullName" class="user-avatar">
              <span class="username">{{ currentUser.username }}</span>
              <i class="fas fa-chevron-down"></i>
              
              <!-- Dropdown Menu -->
              <div class="dropdown-menu" [class.show]="showUserMenu">
                <a routerLink="/profile" class="dropdown-item">
                  <i class="fas fa-user"></i>
                  Profile
                </a>
                <a routerLink="/settings" class="dropdown-item">
                  <i class="fas fa-cog"></i>
                  Settings
                </a>
                <div class="dropdown-divider"></div>
                <a *ngIf="currentUser.role === 'vendor'" routerLink="/vendor/dashboard" class="dropdown-item">
                  <i class="fas fa-store"></i>
                  Vendor Dashboard
                </a>
                <a *ngIf="currentUser.role === 'admin'" routerLink="/admin" class="dropdown-item">
                  <i class="fas fa-shield-alt"></i>
                  Admin Panel
                </a>
                <div class="dropdown-divider" *ngIf="currentUser.role !== 'customer'"></div>
                <button (click)="logout()" class="dropdown-item logout">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>

            <!-- Login/Register for guest users -->
            <div *ngIf="!currentUser" class="auth-buttons">
              <a routerLink="/auth/login" class="btn btn-outline">Login</a>
              <a routerLink="/auth/register" class="btn btn-primary">Sign Up</a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #fff;
      border-bottom: 1px solid #dbdbdb;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 60px;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }

    .logo a {
      text-decoration: none;
    }

    .logo h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    .search-bar {
      position: relative;
      flex: 1;
      max-width: 400px;
      margin: 0 40px;
    }

    .search-bar input {
      width: 100%;
      padding: 8px 16px 8px 40px;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      background: #fafafa;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .search-bar input:focus {
      background: #fff;
      border-color: var(--primary-color);
    }

    .search-bar i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #8e8e8e;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: #262626;
      font-size: 12px;
      transition: color 0.2s;
      padding: 8px;
      border-radius: 4px;
    }

    .nav-item i {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .nav-item.active,
    .nav-item:hover {
      color: var(--primary-color);
    }

    .cart-item {
      position: relative;
    }

    .cart-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
      line-height: 1.2;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .btn-outline {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: transparent;
    }

    .btn-outline:hover {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .user-menu:hover {
      background: #f1f5f9;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .username {
      font-weight: 500;
      font-size: 14px;
    }

    .user-menu i {
      font-size: 12px;
      color: #64748b;
      transition: transform 0.2s;
    }

    .user-menu.active i {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      z-index: 1000;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      text-decoration: none;
      color: #262626;
      font-size: 14px;
      transition: background 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background: #f8fafc;
    }

    .dropdown-item.logout {
      color: #ef4444;
    }

    .dropdown-item.logout:hover {
      background: #fef2f2;
    }

    .dropdown-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .search-bar {
        display: none;
      }
      
      .nav-menu {
        gap: 16px;
      }
      
      .nav-item span {
        display: none;
      }

      .username {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery = '';
  showUserMenu = false;
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to cart count
    this.cartService.cartItemCount$.subscribe((count: number) => {
      this.cartItemCount = count;
    });

    // Load cart on init
    this.cartService.loadCart();

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.showUserMenu = false;
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  openSearch() {
    this.router.navigate(['/search']);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery }
      });
      this.searchQuery = ''; // Clear search after navigation
    } else {
      this.router.navigate(['/search']);
    }
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
