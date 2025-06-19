import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { StoryService } from '../../core/services/story.service';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { ActionSheetController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    private router: Router,
    private productService: ProductService,
    private storyService: StoryService,
    private postService: PostService,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) {}

  async openAddActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Create',
      buttons: [
        {
          text: 'Create Story',
          icon: 'images',
          handler: () => this.openCreateStoryModal()
        },
        {
          text: 'Create Reel',
          icon: 'videocam',
          handler: () => this.openCreateReelModal()
        },
        {
          text: 'Create Post',
          icon: 'create',
          handler: () => this.openCreatePostModal()
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  openCreateStoryModal() {
    // TODO: Implement story creation modal (camera/gallery, caption, upload)
    alert('Story creation modal (Instagram-style) goes here.');
  }

  openCreateReelModal() {
    // TODO: Implement reel creation modal (live camera, record, preview, upload)
    alert('Reel creation modal (TikTok-style) goes here.');
  }

  openCreatePostModal() {
    // TODO: Implement post creation modal/page
    this.router.navigate(['/posts/create']);
  }
  featuredProducts: any[] = [];
  recentStories: any[] = [];
  trendingPosts: any[] = [];
  categories: any[] = [];
  isLoading = true;
  isAuthenticated = false;

  // Slider options
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 10,
    slidesPerView: 1.2,
    centeredSlides: false,
    loop: true,
    autoplay: {
      delay: 3000,
    }
  };

  storySlideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 10,
    slidesPerView: 4.5,
    freeMode: true
  };

  productSlideOpts = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 15,
    slidesPerView: 2.2,
    freeMode: true
  };

  constructor(
    private router: Router,
    private productService: ProductService,
    private storyService: StoryService,
    private postService: PostService,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadHomeData();
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
  }

  async loadHomeData() {
    try {
      this.isLoading = true;
      
      // Load all data in parallel
      const [products, stories, posts] = await Promise.all([
        this.productService.getFeaturedProducts().toPromise(),
        this.storyService.getActiveStories().toPromise(),
        this.postService.getTrendingPosts().toPromise()
      ]);

      this.featuredProducts = products?.data || [];
      this.recentStories = stories?.data || [];
      this.trendingPosts = posts?.data || [];
      
      // Load categories from API
      this.loadCategories();

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onProductClick(product: any) {
    this.router.navigate(['/product', product.id]);
  }

  onStoryClick(story: any) {
    // Navigate to stories viewer with the specific story
    this.router.navigate(['/tabs/stories']);
  }

  onCategoryClick(category: any) {
    this.router.navigate(['/tabs/categories'], { 
      queryParams: { category: category.name.toLowerCase() } 
    });
  }

  onSearchClick() {
    this.router.navigate(['/search']);
  }

  onNotificationsClick() {
    if (this.isAuthenticated) {
      this.router.navigate(['/notifications']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  doRefresh(event: any) {
    this.loadHomeData().then(() => {
      event.target.complete();
    });
  }

  async loadCategories() {
    try {
      // Load categories from API - for now use empty array if API not available
      this.categories = [];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }
}
