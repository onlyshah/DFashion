import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-detail-container" *ngIf="product">
      <!-- Product Images -->
      <div class="product-images">
        <div class="main-image">
          <img [src]="selectedImage.url" [alt]="selectedImage.alt || product.name" class="main-product-image">
          <button 
            class="wishlist-btn" 
            [class.active]="isInWishlist"
            (click)="toggleWishlist()"
          >
            <i [class]="isInWishlist ? 'fas fa-heart' : 'far fa-heart'"></i>
          </button>
        </div>
        <div class="image-thumbnails">
          <img 
            *ngFor="let image of product.images" 
            [src]="image.url" 
            [alt]="image.alt || product.name"
            class="thumbnail"
            [class.active]="selectedImage.url === image.url"
            (click)="selectImage(image)"
          >
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <div class="product-header">
          <h1>{{ product.name }}</h1>
          <div class="brand">{{ product.brand }}</div>
          <div class="rating">
            <div class="stars">
              <i *ngFor="let star of getStars()" [class]="star"></i>
            </div>
            <span class="rating-text">({{ product.rating.count }} reviews)</span>
          </div>
        </div>

        <div class="pricing">
          <div class="current-price">₹{{ product.price | number }}</div>
          <div class="original-price" *ngIf="product.originalPrice">₹{{ product.originalPrice | number }}</div>
          <div class="discount" *ngIf="product.discount > 0">{{ product.discount }}% OFF</div>
        </div>

        <!-- Size Selection -->
        <div class="size-selection" *ngIf="product.sizes.length > 0">
          <h3>Size</h3>
          <div class="size-options">
            <button 
              *ngFor="let size of product.sizes" 
              class="size-btn"
              [class.active]="selectedSize === size.size"
              [class.out-of-stock]="size.stock === 0"
              [disabled]="size.stock === 0"
              (click)="selectSize(size.size)"
            >
              {{ size.size }}
            </button>
          </div>
        </div>

        <!-- Color Selection -->
        <div class="color-selection" *ngIf="product.colors.length > 0">
          <h3>Color</h3>
          <div class="color-options">
            <button 
              *ngFor="let color of product.colors" 
              class="color-btn"
              [class.active]="selectedColor === color.name"
              [style.background-color]="color.code"
              [title]="color.name"
              (click)="selectColor(color.name)"
            >
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="quantity-selection">
          <h3>Quantity</h3>
          <div class="quantity-controls">
            <button class="qty-btn" (click)="decreaseQuantity()" [disabled]="quantity <= 1">-</button>
            <span class="quantity">{{ quantity }}</span>
            <button class="qty-btn" (click)="increaseQuantity()" [disabled]="quantity >= maxQuantity">+</button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            class="btn-add-to-cart" 
            (click)="addToCart()"
            [disabled]="!canAddToCart()"
          >
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
          <button 
            class="btn-buy-now" 
            (click)="buyNow()"
            [disabled]="!canAddToCart()"
          >
            Buy Now
          </button>
        </div>

        <!-- Product Details -->
        <div class="product-details">
          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="detail-section" *ngIf="product.features.length > 0">
            <h3>Features</h3>
            <ul>
              <li *ngFor="let feature of product.features">{{ feature }}</li>
            </ul>
          </div>

          <div class="detail-section" *ngIf="product.material">
            <h3>Material</h3>
            <p>{{ product.material }}</p>
          </div>

          <div class="detail-section" *ngIf="product.careInstructions">
            <h3>Care Instructions</h3>
            <p>{{ product.careInstructions }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="isLoading">
      <div class="spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div class="error-container" *ngIf="error">
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Product Not Found</h3>
        <p>{{ error }}</p>
        <button class="btn-back" (click)="goBack()">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .main-product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wishlist-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1.2rem;
      color: #666;
    }

    .wishlist-btn:hover {
      background: white;
      transform: scale(1.1);
    }

    .wishlist-btn.active {
      color: #e91e63;
    }

    .image-thumbnails {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .thumbnail.active {
      border-color: #007bff;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .product-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .brand {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      color: #ffc107;
    }

    .pricing {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .current-price {
      font-size: 2rem;
      font-weight: 700;
      color: #e91e63;
    }

    .original-price {
      font-size: 1.2rem;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background: #e91e63;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .size-options, .color-options {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .size-btn {
      padding: 0.75rem 1rem;
      border: 2px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }

    .size-btn:hover {
      border-color: #007bff;
    }

    .size-btn.active {
      border-color: #007bff;
      background: #007bff;
      color: white;
    }

    .size-btn.out-of-stock {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .color-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }

    .color-btn.active {
      border-color: #333;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .qty-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .quantity {
      font-size: 1.2rem;
      font-weight: 600;
      min-width: 2rem;
      text-align: center;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-add-to-cart, .btn-buy-now {
      flex: 1;
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-add-to-cart {
      background: #2196f3;
      color: white;
    }

    .btn-add-to-cart:hover {
      background: #1976d2;
    }

    .btn-buy-now {
      background: #ff9800;
      color: white;
    }

    .btn-buy-now:hover {
      background: #f57c00;
    }

    .btn-add-to-cart:disabled,
    .btn-buy-now:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .detail-section {
      margin-bottom: 1.5rem;
    }

    .detail-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .detail-section ul {
      list-style: none;
      padding: 0;
    }

    .detail-section li {
      padding: 0.25rem 0;
      position: relative;
      padding-left: 1rem;
    }

    .detail-section li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #007bff;
    }

    @media (max-width: 768px) {
      .product-detail-container {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  error: string | null = null;
  
  selectedImage: any = null;
  selectedSize: string = '';
  selectedColor: string = '';
  quantity = 1;
  maxQuantity = 10;
  isInWishlist = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.error = null;

    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.product = response.product;
        this.selectedImage = this.product.images[0];
        this.isInWishlist = this.wishlistService.isInWishlist(id);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Product not found or failed to load';
        this.isLoading = false;
        console.error('Product load error:', error);
      }
    });
  }

  selectImage(image: any) {
    this.selectedImage = image;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  increaseQuantity() {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  canAddToCart(): boolean {
    if (!this.product) return false;
    
    // Check if size is required and selected
    if (this.product.sizes.length > 0 && !this.selectedSize) return false;
    
    // Check if color is required and selected
    if (this.product.colors.length > 0 && !this.selectedColor) return false;
    
    return true;
  }

  addToCart() {
    if (!this.product || !this.canAddToCart()) return;

    this.cartService.addToCart(this.product._id, this.quantity, this.selectedSize, this.selectedColor).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Added to cart successfully');
        }
      },
      error: (error) => {
        console.error('Failed to add to cart:', error);
      }
    });
  }

  buyNow() {
    if (!this.product || !this.canAddToCart()) return;

    this.cartService.addToCart(this.product._id, this.quantity, this.selectedSize, this.selectedColor).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/shop/checkout']);
        }
      },
      error: (error) => {
        console.error('Failed to add to cart:', error);
      }
    });
  }

  toggleWishlist() {
    if (!this.product) return;

    this.wishlistService.toggleWishlist(this.product._id).subscribe({
      next: () => {
        this.isInWishlist = !this.isInWishlist;
      },
      error: (error) => {
        console.error('Wishlist error:', error);
        // Fallback to offline mode
        this.wishlistService.toggleWishlistOffline(this.product);
        this.isInWishlist = !this.isInWishlist;
      }
    });
  }

  getStars(): string[] {
    const rating = this.product?.rating.average || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('fas fa-star');
      } else if (i - 0.5 <= rating) {
        stars.push('fas fa-star-half-alt');
      } else {
        stars.push('far fa-star');
      }
    }
    return stars;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
