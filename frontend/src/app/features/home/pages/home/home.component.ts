import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { StoriesComponent } from '../../components/stories/stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, StoriesComponent, FeedComponent, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: any[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          // Show only main categories (first 8)
          this.categories = response.data.slice(0, 8);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Fallback categories
        this.categories = [
          { name: 'Women', slug: 'women', icon: '👩', productCount: 150 },
          { name: 'Men', slug: 'men', icon: '👨', productCount: 120 },
          { name: 'Kids', slug: 'children', icon: '👶', productCount: 80 },
          { name: 'Ethnic', slug: 'ethnic-wear', icon: '🥻', productCount: 90 },
          { name: 'Footwear', slug: 'footwear', icon: '👟', productCount: 75 },
          { name: 'Accessories', slug: 'accessories', icon: '💎', productCount: 60 },
          { name: 'Sports', slug: 'sportswear', icon: '🏃', productCount: 45 },
          { name: 'Winter', slug: 'winter-wear', icon: '🧥', productCount: 35 }
        ];
      }
    });
  }

  navigateToCategory(category: any) {
    this.router.navigate(['/category', category.slug]);
  }
}
