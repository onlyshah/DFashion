import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CartService, CartItem, CartSummary } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-page">
      <div class="cart-header">
        <h1>Shopping Cart</h1>
        <p *ngIf="cartItems.length > 0">{{ getTotalItems() }} items</p>
      </div>

      <div class="cart-content" *ngIf="cartItems.length > 0">
        <div class="cart-items">
          <div *ngFor="let item of cartItems" class="cart-item">
            <div class="item-image">
              <img [src]="item.product.images[0].url" [alt]="item.product.name">
            </div>
            <div class="item-details">
              <h3>{{ item.product.name }}</h3>
              <p class="brand">{{ item.product.brand }}</p>
              <div class="item-options" *ngIf="item.size || item.color">
                <span *ngIf="item.size">Size: {{ item.size }}</span>
                <span *ngIf="item.color">Color: {{ item.color }}</span>
              </div>
              <div class="item-price">
                <span class="current-price">₹{{ item.product.price | number }}</span>
                <span class="original-price" *ngIf="item.product.originalPrice">₹{{ item.product.originalPrice | number }}</span>
              </div>
            </div>
            <div class="item-quantity">
              <button class="qty-btn" (click)="decreaseQuantity(item)" [disabled]="item.quantity <= 1">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="qty-btn" (click)="increaseQuantity(item)">+</button>
            </div>
            <div class="item-total">
              ₹{{ (item.product.price * item.quantity) | number }}
            </div>
            <button class="remove-btn" (click)="removeItem(item)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal ({{ getTotalItems() }} items)</span>
              <span>₹{{ getSubtotal() | number }}</span>
            </div>
            <div class="summary-row" *ngIf="getDiscount() > 0">
              <span>Discount</span>
              <span class="discount">-₹{{ getDiscount() | number }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr>
            <div class="summary-row total">
              <span>Total</span>
              <span>₹{{ getTotal() | number }}</span>
            </div>
            <button class="checkout-btn" (click)="proceedToCheckout()">
              Proceed to Checkout
            </button>
            <button class="continue-shopping-btn" (click)="continueShopping()">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div class="empty-cart" *ngIf="cartItems.length === 0 && !isLoading">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started</p>
        <button class="shop-now-btn" (click)="continueShopping()">
          Shop Now
        </button>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading cart...</p>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .cart-header {
      margin-bottom: 2rem;
    }

    .cart-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      align-items: center;
    }

    .item-image img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .item-options {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .item-price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .current-price {
      font-weight: 600;
      color: #e91e63;
    }

    .original-price {
      color: #999;
      text-decoration: line-through;
      font-size: 0.9rem;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.25rem;
    }

    .qty-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: #f8f9fa;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .qty-btn:hover:not(:disabled) {
      background: #e9ecef;
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
    }

    .item-total {
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }

    .remove-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: #f8f9fa;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #dc3545;
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: #dc3545;
      color: white;
    }

    .summary-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      position: sticky;
      top: 2rem;
    }

    .summary-card h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .summary-row.total {
      font-weight: 700;
      font-size: 1.2rem;
      color: #333;
    }

    .discount {
      color: #28a745;
    }

    .checkout-btn {
      width: 100%;
      background: #007bff;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 1rem;
      transition: background 0.2s;
    }

    .checkout-btn:hover {
      background: #0056b3;
    }

    .continue-shopping-btn {
      width: 100%;
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .continue-shopping-btn:hover {
      background: #007bff;
      color: white;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-cart i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #ddd;
    }

    .shop-now-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto auto;
        gap: 0.5rem;
      }

      .item-quantity,
      .item-total,
      .remove-btn {
        grid-column: 1 / -1;
        justify-self: start;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary | null = null;
  isLoading = true;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.subscribeToCartUpdates();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.data.items;
        this.cartSummary = response.data.summary;
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
    });

    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
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
