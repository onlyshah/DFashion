import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, NotificationComponent],
  template: `
    <div class="app-container">
      <app-header *ngIf="showHeader"></app-header>
      <main class="main-content" [class.with-header]="showHeader">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Notifications -->
    <app-notification></app-notification>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      transition: all 0.3s ease;
    }

    .main-content.with-header {
      margin-top: 60px;
    }

    @media (max-width: 768px) {
      .main-content.with-header {
        margin-top: 56px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'DFashion';
  showHeader = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Hide header on auth pages
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;
        this.showHeader = !navigationEnd.url.includes('/auth');
      });

    // Initialize auth state
    this.authService.initializeAuth();
  }
}
