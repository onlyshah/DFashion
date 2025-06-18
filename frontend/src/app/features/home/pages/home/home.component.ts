import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstagramStoriesComponent } from '../../components/instagram-stories/instagram-stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, InstagramStoriesComponent, FeedComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Home component initialization
  }
}
