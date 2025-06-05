import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoriesComponent } from '../../components/stories/stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, StoriesComponent, FeedComponent, SidebarComponent],
  template: `
    <div class="home-container">
      <div class="content-grid">
        <!-- Main Feed -->
        <div class="main-content">
          <app-stories></app-stories>
          <app-feed></app-feed>
        </div>
        
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px 0;
      min-height: calc(100vh - 60px);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 40px;
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
        max-width: 600px;
      }
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 16px 0;
      }
      
      .content-grid {
        padding: 0 16px;
        gap: 20px;
      }
      
      .main-content {
        gap: 20px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
