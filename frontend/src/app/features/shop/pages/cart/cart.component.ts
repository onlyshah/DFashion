import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CartService, CartItem, CartSummary } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary | null = null;
  isLoading = true;
  selectedItems: string[] = [];
  cartCount = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.subscribeToCartUpdates();
    this.subscribeToCartCount();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.cart?.items || [];
        this.cartSummary = response.summary;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load cart:', error);
        this.isLoading = false;
      }
    });
  }

  subscribeToCartUpdates() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.isLoading = false;
      // Clear selections when cart updates
      this.selectedItems = this.selectedItems.filter(id =>
        items.some(item => item._id === id)
      );
    });

    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
  }

  subscribeToCartCount() {
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  // Selection methods
  toggleItemSelection(itemId: string) {
    const index = this.selectedItems.indexOf(itemId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(itemId);
    }
  }

  toggleSelectAll() {
    if (this.allItemsSelected()) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.cartItems.map(item => item._id);
    }
  }

  allItemsSelected(): boolean {
    return this.cartItems.length > 0 &&
           this.selectedItems.length === this.cartItems.length;
  }

  // Bulk operations
  bulkRemoveItems() {
    if (this.selectedItems.length === 0) return;

    if (confirm(`Are you sure you want to remove ${this.selectedItems.length} item(s) from your cart?`)) {
      this.cartService.bulkRemoveFromCart(this.selectedItems).subscribe({
        next: (response) => {
          console.log(`✅ ${response.removedCount} items removed from cart`);
          this.selectedItems = [];
          this.loadCart();
        },
        error: (error) => {
          console.error('Failed to remove items:', error);
        }
      });
    }
  }

  refreshCart() {
    this.isLoading = true;
    this.cartService.refreshCartCount();
    this.loadCart();
  }

  async increaseQuantity(item: CartItem) {
    this.cartService.updateCartItem(item._id, item.quantity + 1).subscribe({
      next: () => {
        this.loadCart(); // Refresh cart
      },
      error: (error) => {
        console.error('Failed to update quantity:', error);
      }
    });
  }

  async decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateCartItem(item._id, item.quantity - 1).subscribe({
        next: () => {
          this.loadCart(); // Refresh cart
        },
        error: (error) => {
          console.error('Failed to update quantity:', error);
        }
      });
    }
  }

  async removeItem(item: CartItem) {
    this.cartService.removeFromCart(item._id).subscribe({
      next: () => {
        this.loadCart(); // Refresh cart
      },
      error: (error) => {
        console.error('Failed to remove item:', error);
      }
    });
  }

  getTotalItems(): number {
    return this.cartSummary?.totalQuantity || 0;
  }

  getSubtotal(): number {
    return this.cartSummary?.subtotal || 0;
  }

  getDiscount(): number {
    return this.cartSummary?.discount || 0;
  }

  getTotal(): number {
    return this.cartSummary?.total || 0;
  }

  proceedToCheckout() {
    this.router.navigate(['/shop/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
