import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
  permission?: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <mat-sidenav-container class="sidebar-container">
      <mat-sidenav #sidenav mode="side" opened class="sidebar">
        <!-- Logo Section -->
        <div class="sidebar-header">
          <div class="logo">
            <mat-icon>store</mat-icon>
            <span>DFashion Admin</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <div *ngFor="let item of menuItems" class="nav-item">
            <!-- Main Menu Item -->
            <a 
              *ngIf="!item.children"
              mat-button 
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-link">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
              <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
            </a>

            <!-- Menu Item with Children -->
            <div *ngIf="item.children" class="nav-group">
              <button 
                mat-button 
                class="nav-link expandable"
                [class.expanded]="isExpanded(item.label)"
                (click)="toggleExpanded(item.label)">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
                <mat-icon class="expand-icon">
                  {{ isExpanded(item.label) ? 'expand_less' : 'expand_more' }}
                </mat-icon>
              </button>

              <div class="sub-menu" [class.expanded]="isExpanded(item.label)">
                <a 
                  *ngFor="let child of item.children"
                  mat-button 
                  [routerLink]="child.route"
                  routerLinkActive="active"
                  class="nav-link sub-link">
                  <mat-icon>{{ child.icon }}</mat-icon>
                  <span>{{ child.label }}</span>
                  <span *ngIf="child.badge" class="nav-badge">{{ child.badge }}</span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        <!-- User Section -->
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="currentUser">
            <div class="user-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="user-details">
              <div class="user-name">{{ currentUser.fullName }}</div>
              <div class="user-role">{{ currentUser.role | titlecase }}</div>
            </div>
          </div>
          
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
            <mat-icon>more_vert</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/admin/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item routerLink="/admin/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();

  currentUser: any = null;
  expandedItems: Set<string> = new Set();
  currentRoute: string = '';

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'Users',
      icon: 'people',
      route: '/admin/users',
      children: [
        { label: 'All Users', icon: 'list', route: '/admin/users' },
        { label: 'Add User', icon: 'person_add', route: '/admin/users/new' },
        { label: 'Roles & Permissions', icon: 'security', route: '/admin/users/roles' }
      ]
    },
    {
      label: 'Products',
      icon: 'inventory_2',
      route: '/admin/products',
      children: [
        { label: 'All Products', icon: 'list', route: '/admin/products' },
        { label: 'Add Product', icon: 'add_box', route: '/admin/products/new' },
        { label: 'Categories', icon: 'category', route: '/admin/products/categories' },
        { label: 'Inventory', icon: 'warehouse', route: '/admin/products/inventory' }
      ]
    },
    {
      label: 'Orders',
      icon: 'shopping_cart',
      route: '/admin/orders',
      badge: '12'
    },
    {
      label: 'Analytics',
      icon: 'analytics',
      route: '/admin/analytics'
    },
    {
      label: 'Marketing',
      icon: 'campaign',
      route: '/admin/marketing',
      children: [
        { label: 'Campaigns', icon: 'email', route: '/admin/marketing/campaigns' },
        { label: 'Coupons', icon: 'local_offer', route: '/admin/marketing/coupons' },
        { label: 'Reviews', icon: 'rate_review', route: '/admin/marketing/reviews' }
      ]
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/admin/settings'
    }
  ];

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.autoExpandForCurrentRoute();
      }
    });

    // Set initial route
    this.currentRoute = this.router.url;
    this.autoExpandForCurrentRoute();
  }

  toggleExpanded(itemLabel: string): void {
    if (this.expandedItems.has(itemLabel)) {
      this.expandedItems.delete(itemLabel);
    } else {
      this.expandedItems.add(itemLabel);
    }
  }

  isExpanded(itemLabel: string): boolean {
    return this.expandedItems.has(itemLabel);
  }

  private autoExpandForCurrentRoute(): void {
    // Auto-expand menu items based on current route
    for (const item of this.menuItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          this.currentRoute.startsWith(child.route)
        );
        if (hasActiveChild) {
          this.expandedItems.add(item.label);
        }
      }
    }
  }

  logout(): void {
    this.adminAuthService.logout();
  }
}
