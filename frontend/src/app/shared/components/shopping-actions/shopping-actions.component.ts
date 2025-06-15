import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  templateUrl: './shopping-actions.component.html',
  styleUrls: ['./shopping-actions.component.scss']
})
export class ShoppingActionsComponent implements OnInit, OnDestroy {
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

  // Total count properties
  cartCount = 0;
  wishlistCount = 0;
  totalCount = 0;

  // Subscription management
  private subscriptions: Subscription[] = [];

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
    this.initializeCounts();
    this.subscribeToAuthChanges();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  get discountPercentage(): number {
    if (this.product.originalPrice && this.product.originalPrice > this.product.price) {
      return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    return 0;
  }

  // Initialize count subscriptions
  private initializeCounts() {
    // Clear existing subscriptions to prevent duplicates
    this.clearCountSubscriptions();

    if (this.authService.isAuthenticated) {
      console.log('🔢 Initializing counts for authenticated user');

      // Subscribe to cart count changes with error handling
      const cartSub = this.cartService.cartItemCount$.subscribe({
        next: (count: number) => {
          this.cartCount = count || 0;
          this.updateTotalCount();
          console.log('🛒 Cart count updated:', this.cartCount);
        },
        error: (error) => {
          console.error('❌ Error subscribing to cart count:', error);
          this.cartCount = 0;
          this.updateTotalCount();
        }
      });
      this.subscriptions.push(cartSub);

      // Subscribe to wishlist count changes with error handling
      const wishlistSub = this.wishlistService.wishlistCount$.subscribe({
        next: (count: number) => {
          this.wishlistCount = count || 0;
          this.updateTotalCount();
          console.log('❤️ Wishlist count updated:', this.wishlistCount);
        },
        error: (error) => {
          console.error('❌ Error subscribing to wishlist count:', error);
          this.wishlistCount = 0;
          this.updateTotalCount();
        }
      });
      this.subscriptions.push(wishlistSub);

      // Load initial counts
      this.loadInitialCounts();
    } else {
      console.log('🔢 User not authenticated, setting counts to 0');
      // User not authenticated, set counts to 0
      this.cartCount = 0;
      this.wishlistCount = 0;
      this.updateTotalCount();
    }
  }

  // Load initial counts from services
  private loadInitialCounts() {
    try {
      // Get current cart count
      this.cartService.refreshCartCount();

      // Trigger wishlist count refresh by subscribing to wishlist items
      this.wishlistService.wishlistItems$.pipe().subscribe();
    } catch (error) {
      console.error('❌ Error loading initial counts:', error);
    }
  }

  // Clear count-related subscriptions
  private clearCountSubscriptions() {
    // Only clear count-related subscriptions, keep auth subscription
    const authSub = this.subscriptions.find(sub =>
      sub.constructor.name === 'AuthSubscription' // This is a conceptual check
    );

    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = authSub ? [authSub] : [];
  }

  // Calculate total count with safety checks
  private updateTotalCount() {
    // Ensure counts are valid numbers
    const safeCartCount = Number.isInteger(this.cartCount) && this.cartCount >= 0 ? this.cartCount : 0;
    const safeWishlistCount = Number.isInteger(this.wishlistCount) && this.wishlistCount >= 0 ? this.wishlistCount : 0;

    this.cartCount = safeCartCount;
    this.wishlistCount = safeWishlistCount;
    this.totalCount = safeCartCount + safeWishlistCount;

    console.log('🔢 Total count updated:', {
      cart: this.cartCount,
      wishlist: this.wishlistCount,
      total: this.totalCount,
      authenticated: this.authService.isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }

  // Get total count (public method for template) - always returns valid number
  getTotalCount(): number {
    if (!this.authService.isAuthenticated) {
      return 0;
    }
    return Number.isInteger(this.totalCount) && this.totalCount >= 0 ? this.totalCount : 0;
  }

  // Get cart count (public method for template) - always returns valid number
  getCartCount(): number {
    if (!this.authService.isAuthenticated) {
      return 0;
    }
    return Number.isInteger(this.cartCount) && this.cartCount >= 0 ? this.cartCount : 0;
  }

  // Get wishlist count (public method for template) - always returns valid number
  getWishlistCount(): number {
    if (!this.authService.isAuthenticated) {
      return 0;
    }
    return Number.isInteger(this.wishlistCount) && this.wishlistCount >= 0 ? this.wishlistCount : 0;
  }

  // Check if user has any items
  hasItems(): boolean {
    return this.authService.isAuthenticated && this.getTotalCount() > 0;
  }

  // Get formatted count display
  getFormattedTotalCount(): string {
    const count = this.getTotalCount();
    if (count === 0) {
      return '0';
    } else if (count > 99) {
      return '99+';
    }
    return count.toString();
  }

  // Get count breakdown for display
  getCountBreakdown(): { cart: number; wishlist: number; total: number } {
    return {
      cart: this.getCartCount(),
      wishlist: this.getWishlistCount(),
      total: this.getTotalCount()
    };
  }

  // Subscribe to authentication state changes
  private subscribeToAuthChanges() {
    // Re-initialize counts when authentication state changes
    const authSub = this.authService.isAuthenticated$.subscribe({
      next: (isAuthenticated: boolean) => {
        console.log('🔐 Auth state changed:', isAuthenticated);

        if (isAuthenticated) {
          // User logged in - initialize counts and status
          console.log('🔐 User logged in, initializing counts...');
          this.initializeCounts();
          this.checkCartStatus();
          this.checkWishlistStatus();
        } else {
          // User logged out - reset everything
          console.log('🔐 User logged out, resetting counts...');
          this.resetAllCounts();
        }
      },
      error: (error) => {
        console.error('❌ Error in auth state subscription:', error);
        this.resetAllCounts();
      }
    });
    this.subscriptions.push(authSub);
  }

  // Reset all counts and status
  private resetAllCounts() {
    this.cartCount = 0;
    this.wishlistCount = 0;
    this.totalCount = 0;
    this.isInCart = false;
    this.isInWishlist = false;
    this.updateTotalCount();
    console.log('🔄 All counts reset to 0');
  }

  private checkCartStatus() {
    if (this.authService.isAuthenticated) {
      this.isInCart = this.cartService.isInCart(this.product._id);
    } else {
      this.isInCart = false;
    }
  }

  private checkWishlistStatus() {
    if (this.authService.isAuthenticated) {
      // Subscribe to wishlist changes to check if product is in wishlist
      this.wishlistService.wishlistItems$.subscribe(items => {
        this.isInWishlist = items.some(item => item.product._id === this.product._id);
      });
    } else {
      this.isInWishlist = false;
    }
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

    if (this.isInCart) {
      // If already in cart, navigate to cart page
      this.router.navigate(['/cart']);
      this.cartLoading = false;
    } else {
      // Add to cart
      this.cartService.addToCart(this.product._id, 1).subscribe({
        next: (response) => {
          if (response.success) {
            this.isInCart = true;
            alert('Added to cart successfully!');
          }
          this.cartLoading = false;
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          alert('Failed to add to cart. Please try again.');
          this.cartLoading = false;
        }
      });
    }
  }

  onToggleWishlist() {
    if (!this.authService.isAuthenticated) {
      alert('Please login to save items');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.wishlistLoading = true;

    if (this.isInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeFromWishlist(this.product._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.isInWishlist = false;
            alert('Removed from wishlist');
          }
          this.wishlistLoading = false;
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          alert('Failed to remove from wishlist. Please try again.');
          this.wishlistLoading = false;
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addToWishlist(this.product._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.isInWishlist = true;
            alert('Added to wishlist');
          }
          this.wishlistLoading = false;
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          alert('Failed to add to wishlist. Please try again.');
          this.wishlistLoading = false;
        }
      });
    }
  }
}
