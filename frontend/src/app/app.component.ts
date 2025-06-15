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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DFashion';
  showHeader = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Hide header on auth pages and admin login
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;
        const url = navigationEnd.url;

        // Hide header on auth pages, admin login, stories, and post details for full-screen experience
        const shouldHideHeader = url.includes('/auth') ||
                                url.includes('/admin/login') ||
                                url.includes('/admin/auth') ||
                                url.startsWith('/admin/login') ||
                                url.startsWith('/stories') ||
                                url.startsWith('/post/');

        this.showHeader = !shouldHideHeader;
      });

    // Set initial header visibility
    const currentUrl = this.router.url;
    const shouldHideHeader = currentUrl.includes('/auth') ||
                            currentUrl.includes('/admin/login') ||
                            currentUrl.includes('/admin/auth') ||
                            currentUrl.startsWith('/admin/login') ||
                            currentUrl.startsWith('/stories') ||
                            currentUrl.startsWith('/post/');

    this.showHeader = !shouldHideHeader;

    // Initialize auth state
    this.authService.initializeAuth();
  }
}
