import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
// import { ToastrService } from 'ngx-toastr';

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  brand: string;
  sizes?: { size: string; stock: number }[];
  colors?: string[];
  isActive: boolean;
  stock: number;
}

@Component({
  selector: 'app-shopping-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shopping-actions" [class.compact]="compact">
      <!-- Buy Now Button -->
      <button 
        class="action-btn buy-btn"
        [class.loading]="buyLoading"
        [disabled]="!product.isActive || product.stock === 0 || buyLoading"
        (click)="onBuyNow()"
        [attr.aria-label]="'Buy ' + product.name"
      >
        <i class="fas fa-shopping-bag" *ngIf="!buyLoading"></i>
        <i class="fas fa-spinner fa-spin" *ngIf="buyLoading"></i>
        <span *ngIf="!compact">{{ product.stock === 0 ? 'Out of Stock' : 'Buy Now' }}</span>
      </button>

      <!-- Add to Cart Button -->
      <button 
        class="action-btn cart-btn"
        [class.loading]="cartLoading"
        [class.added]="isInCart"
        [disabled]="!product.isActive || product.stock === 0 || cartLoading"
        (click)="onAddToCart()"
        [attr.aria-label]="isInCart ? 'Remove from cart' : 'Add to cart'"
      >
        <i class="fas fa-shopping-cart" *ngIf="!cartLoading && !isInCart"></i>
        <i class="fas fa-check" *ngIf="!cartLoading && isInCart"></i>
        <i class="fas fa-spinner fa-spin" *ngIf="cartLoading"></i>
        <span *ngIf="!compact">{{ isInCart ? 'In Cart' : 'Add to Cart' }}</span>
      </button>

      <!-- Wishlist Button -->
      <button 
        class="action-btn wishlist-btn"
        [class.loading]="wishlistLoading"
        [class.added]="isInWishlist"
        [disabled]="wishlistLoading"
        (click)="onToggleWishlist()"
        [attr.aria-label]="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
      >
        <i class="fas fa-heart" *ngIf="!wishlistLoading && isInWishlist"></i>
        <i class="far fa-heart" *ngIf="!wishlistLoading && !isInWishlist"></i>
        <i class="fas fa-spinner fa-spin" *ngIf="wishlistLoading"></i>
        <span *ngIf="!compact">{{ isInWishlist ? 'Saved' : 'Save' }}</span>
      </button>

      <!-- Price Display -->
      <div class="price-display" *ngIf="showPrice">
        <span class="current-price">₹{{ product.price | number:'1.0-0' }}</span>
        <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
          ₹{{ product.originalPrice | number:'1.0-0' }}
        </span>
        <span class="discount" *ngIf="discountPercentage > 0">
          {{ discountPercentage }}% OFF
        </span>
      </div>
    </div>
  `,
  styles: [`
    .shopping-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      padding: 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .shopping-actions.compact {
      padding: 8px;
      gap: 6px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 44px;
      min-height: 44px;
      position: relative;
      overflow: hidden;
    }

    .shopping-actions.compact .action-btn {
      padding: 8px 12px;
      font-size: 12px;
      min-width: 36px;
      min-height: 36px;
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .action-btn:not(:disabled):active {
      transform: translateY(0);
    }

    .buy-btn {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
    }

    .buy-btn:not(:disabled):hover {
      background: linear-gradient(135deg, #ee5a24, #ff6b6b);
    }

    .cart-btn {
      background: linear-gradient(135deg, #4834d4, #686de0);
      color: white;
    }

    .cart-btn.added {
      background: linear-gradient(135deg, #00d2d3, #01a3a4);
    }

    .cart-btn:not(:disabled):hover {
      background: linear-gradient(135deg, #686de0, #4834d4);
    }

    .cart-btn.added:not(:disabled):hover {
      background: linear-gradient(135deg, #01a3a4, #00d2d3);
    }

    .wishlist-btn {
      background: linear-gradient(135deg, #ff9ff3, #f368e0);
      color: white;
    }

    .wishlist-btn.added {
      background: linear-gradient(135deg, #ff3838, #ff6b6b);
    }

    .wishlist-btn:not(:disabled):hover {
      background: linear-gradient(135deg, #f368e0, #ff9ff3);
    }

    .wishlist-btn.added:not(:disabled):hover {
      background: linear-gradient(135deg, #ff6b6b, #ff3838);
    }

    .price-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-left: auto;
    }

    .current-price {
      font-weight: 700;
      font-size: 16px;
      color: #2d3436;
    }

    .original-price {
      font-size: 12px;
      color: #636e72;
      text-decoration: line-through;
      margin-top: 2px;
    }

    .discount {
      font-size: 10px;
      color: #00b894;
      font-weight: 600;
      background: rgba(0, 184, 148, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 2px;
    }

    .loading {
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .shopping-actions {
        padding: 8px;
        gap: 6px;
      }

      .action-btn {
        padding: 8px 12px;
        font-size: 12px;
        min-width: 36px;
        min-height: 36px;
      }

      .action-btn span {
        display: none;
      }

      .price-display {
        margin-left: 8px;
      }

      .current-price {
        font-size: 14px;
      }
    }
  `]
})
export class ShoppingActionsComponent implements OnInit {
  @Input() product!: Product;
  @Input() compact = false;
  @Input() showPrice = true;
  @Output() productClick = new EventEmitter<Product>();
  @Output() buyNowClick = new EventEmitter<Product>();

  buyLoading = false;
  cartLoading = false;
  wishlistLoading = false;
  isInCart = false;
  isInWishlist = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private router: Router
    // private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.checkCartStatus();
    this.checkWishlistStatus();
  }

  get discountPercentage(): number {
    if (this.product.originalPrice && this.product.originalPrice > this.product.price) {
      return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    return 0;
  }

  private checkCartStatus() {
    // TODO: Implement cart status check when service is ready
    this.isInCart = false;
  }

  private checkWishlistStatus() {
    // TODO: Implement wishlist status check when service is ready
    this.isInWishlist = false;
  }

  onBuyNow() {
    if (!this.authService.isAuthenticated) {
      alert('Please login to continue shopping');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.buyLoading = true;
    this.buyNowClick.emit(this.product);

    // Simulate buy now action
    setTimeout(() => {
      this.router.navigate(['/checkout']);
      this.buyLoading = false;
    }, 1000);
  }

  onAddToCart() {
    if (!this.authService.isAuthenticated) {
      alert('Please login to add items to cart');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartLoading = true;

    // Simulate cart action
    setTimeout(() => {
      if (this.isInCart) {
        this.isInCart = false;
        alert('Removed from cart');
      } else {
        this.isInCart = true;
        alert('Added to cart');
      }
      this.cartLoading = false;
    }, 1000);
  }

  onToggleWishlist() {
    if (!this.authService.isAuthenticated) {
      alert('Please login to save items');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.wishlistLoading = true;

    // Simulate wishlist action
    setTimeout(() => {
      if (this.isInWishlist) {
        this.isInWishlist = false;
        alert('Removed from wishlist');
      } else {
        this.isInWishlist = true;
        alert('Added to wishlist');
      }
      this.wishlistLoading = false;
    }, 1000);
  }
}
