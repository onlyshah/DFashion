import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
// import { environment } from '../../../../environments/environment';

interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  isActive: boolean;
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

@Component({
  selector: 'app-instagram-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instagram-stories.component.html',
  styleUrls: ['./instagram-stories.component.scss']
})
export class InstagramStoriesComponent implements OnInit, OnDestroy {
  @ViewChild('storiesContainer', { static: false }) storiesContainer!: ElementRef;
  @ViewChild('feedCover', { static: false }) feedCover!: ElementRef;

  stories: Story[] = [];
  isLoadingStories = true;

  currentIndex = 0;
  isOpen = false;
  isRotating = false;
  isDragging = false;
  rotateY = 0;
  targetRotateY = 0;
  targetDirection: 'forward' | 'back' | null = null;
  
  // Touch/drag properties
  dragStartX = 0;
  dragCurrentX = 0;
  minDragPercentToTransition = 0.5;
  minVelocityToTransition = 0.65;
  transitionSpeed = 6;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadStories();
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.removeEventListeners();
  }

  loadStories() {
    this.isLoadingStories = true;

    // Try to load from API first
    this.subscriptions.push(
      this.http.get<any>(`http://localhost:3000/api/stories/active`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stories = response.data;
          } else {
            this.loadFallbackStories();
          }
          this.isLoadingStories = false;
        },
        error: (error) => {
          console.error('Error loading stories:', error);
          this.loadFallbackStories();
          this.isLoadingStories = false;
        }
      })
    );
  }

  loadFallbackStories() {
    // Fallback stories with realistic data
    this.stories = [
      {
        _id: 'story-1',
        user: {
          _id: 'user-1',
          username: 'ai_fashionista_maya',
          fullName: 'Maya Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        mediaType: 'image',
        caption: 'Sustainable fashion is the future! 🌱✨',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(), // 19 hours from now
        views: 1247,
        isActive: true,
        products: [
          {
            _id: 'prod-1',
            name: 'Eco-Friendly Summer Dress',
            price: 2499,
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200'
          }
        ]
      },
      {
        _id: 'story-2',
        user: {
          _id: 'user-2',
          username: 'ai_stylist_alex',
          fullName: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        mediaType: 'image',
        caption: 'Street style essentials for the modern man 🔥',
        createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
        expiresAt: new Date(Date.now() + 18.8 * 60 * 60 * 1000).toISOString(),
        views: 892,
        isActive: true,
        products: [
          {
            _id: 'prod-2',
            name: 'Urban Cotton T-Shirt',
            price: 899,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'
          }
        ]
      },
      {
        _id: 'story-3',
        user: {
          _id: 'user-3',
          username: 'ai_trendsetter_zara',
          fullName: 'Zara Patel',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
        mediaType: 'image',
        caption: 'Ethnic fusion at its finest! Traditional meets modern ✨',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
        views: 2156,
        isActive: true,
        products: [
          {
            _id: 'prod-3',
            name: 'Designer Ethnic Kurti',
            price: 1899,
            image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200'
          }
        ]
      },
      {
        _id: 'story-4',
        user: {
          _id: 'user-4',
          username: 'ai_minimalist_kai',
          fullName: 'Kai Thompson',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        mediaType: 'image',
        caption: 'Less is more. Minimalist wardrobe essentials 🌿',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
        views: 1543,
        isActive: true,
        products: [
          {
            _id: 'prod-4',
            name: 'Classic Denim Jeans',
            price: 2999,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200'
          }
        ]
      },
      {
        _id: 'story-5',
        user: {
          _id: 'user-5',
          username: 'ai_glamour_sophia',
          fullName: 'Sophia Williams',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
        },
        mediaUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        mediaType: 'image',
        caption: 'Luxury accessories for the discerning fashionista 💎',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        views: 3421,
        isActive: true,
        products: [
          {
            _id: 'prod-5',
            name: 'Luxury Leather Handbag',
            price: 4999,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200'
          }
        ]
      }
    ];
  }

  openStories(index: number = 0) {
    this.currentIndex = index;
    this.isOpen = true;
    this.showStory(index);
    document.body.style.overflow = 'hidden';
  }

  closeStories() {
    this.isOpen = false;
    this.pauseAllVideos();
    document.body.style.overflow = 'auto';
    
    // Add closing animation
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.classList.add('is-closed');
    }
    
    setTimeout(() => {
      if (this.storiesContainer) {
        this.storiesContainer.nativeElement.classList.remove('is-closed');
      }
    }, 300);
  }

  showStory(index: number) {
    this.currentIndex = index;
    this.rotateY = 0;
    
    // Reset container transform
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 'translateZ(-50vw)';
    }
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.targetRotateY = -90;
      this.targetDirection = 'forward';
      this.isRotating = true;
      this.update();
    } else {
      this.closeStories();
    }
  }

  previousStory() {
    if (this.currentIndex > 0) {
      this.targetRotateY = 90;
      this.targetDirection = 'back';
      this.isRotating = true;
      this.update();
    } else {
      this.closeStories();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStories();
        break;
    }
  }

  onStoryClick(event: MouseEvent) {
    if (this.isRotating) return;
    
    const clickX = event.clientX;
    const windowWidth = window.innerWidth;
    
    // Left third goes back, right two-thirds go forward
    if (clickX < windowWidth / 3) {
      this.previousStory();
    } else {
      this.nextStory();
    }
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.dragStartX = event.touches[0].clientX;
    this.dragCurrentX = this.dragStartX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    this.dragCurrentX = event.touches[0].clientX;
    this.updateDragPosition();
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const dragDelta = this.dragCurrentX - this.dragStartX;
    const threshold = window.innerWidth * this.minDragPercentToTransition;
    
    if (Math.abs(dragDelta) > threshold) {
      if (dragDelta > 0) {
        this.previousStory();
      } else {
        this.nextStory();
      }
    } else {
      // Snap back to current position
      this.targetRotateY = 0;
      this.isRotating = true;
      this.update();
    }
  }

  private updateDragPosition() {
    const dragDelta = this.dragCurrentX - this.dragStartX;
    this.rotateY = (dragDelta / window.innerWidth) * 90;
    
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 
        `translateZ(-50vw) rotateY(${this.rotateY}deg)`;
    }
  }

  private update() {
    if (!this.isRotating) return;
    
    // Simple easing
    this.rotateY += (this.targetRotateY - this.rotateY) / this.transitionSpeed;
    
    // Check if animation is complete
    if (Math.abs(this.rotateY - this.targetRotateY) < 0.5) {
      this.rotateY = this.targetRotateY;
      this.isRotating = false;
      
      if (this.targetDirection) {
        const newIndex = this.targetDirection === 'forward' 
          ? this.currentIndex + 1 
          : this.currentIndex - 1;
        this.showStory(newIndex);
        this.targetDirection = null;
      }
      return;
    }
    
    // Update transform
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 
        `translateZ(-50vw) rotateY(${this.rotateY}deg)`;
    }
    
    requestAnimationFrame(() => this.update());
  }

  private pauseAllVideos() {
    const videos = document.querySelectorAll('.story__video');
    videos.forEach((video: any) => {
      if (video.pause) {
        video.pause();
      }
    });
  }

  private setupEventListeners() {
    // Additional event listeners can be added here
  }

  private removeEventListeners() {
    // Clean up event listeners
  }

  getCurrentStory(): Story {
    return this.stories[this.currentIndex];
  }

  getStoryProgress(): number {
    return ((this.currentIndex + 1) / this.stories.length) * 100;
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  hasProducts(): boolean {
    const story = this.getCurrentStory();
    return !!(story && story.products && story.products.length > 0);
  }

  getStoryProducts(): any[] {
    const story = this.getCurrentStory();
    return story?.products || [];
  }
}
