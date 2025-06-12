import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: { url: string; isPrimary: boolean }[];
    brand: string;
    discount?: number;
  };
  quantity: number;
  size?: string;
  color?: string;
  addedAt: Date;
}

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = environment.apiUrl;
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartSummary = new BehaviorSubject<CartSummary | null>(null);
  private cartItemCount = new BehaviorSubject<number>(0);

  public cartItems$ = this.cartItems.asObservable();
  public cartSummary$ = this.cartSummary.asObservable();
  public cartItemCount$ = this.cartItemCount.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    this.loadCart();
  }

  // Get cart from API
  getCart(): Observable<{ success: boolean; data: { items: CartItem[]; summary: CartSummary } }> {
    return this.http.get<{ success: boolean; data: { items: CartItem[]; summary: CartSummary } }>(`${this.API_URL}/cart`);
  }

  // Load cart and update local state
  loadCart() {
    // Always try local storage first for guest shopping
    this.loadCartFromStorage();

    // Also try to sync with API if user is logged in
    this.getCart().subscribe({
      next: (response) => {
        // Only update if API has more recent data
        if (response.data.items && response.data.items.length > 0) {
          this.cartItems.next(response.data.items);
          this.cartSummary.next(response.data.summary);
          this.updateCartCount();
        }
      },
      error: (error) => {
        console.log('API cart not available, using local storage');
        // Already loaded from storage above
      }
    });
  }

  private async loadCartFromStorage() {
    try {
      // Wait a bit for storage to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      const cart = await this.storageService.getCart();
      this.cartItems.next(cart || []);
      this.updateCartCount();
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItems.next([]);
      this.updateCartCount();
    }
  }

  private async saveCartToStorage() {
    try {
      await this.storageService.setCart(this.cartItems.value);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private updateCartCount() {
    const items = this.cartItems.value || [];
    const count = items.reduce((total, item) => total + item.quantity, 0);
    this.cartItemCount.next(count);
  }

  // Add item to cart via API
  addToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<{ success: boolean; message: string }> {
    const payload = { productId, quantity, size, color };
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/cart`, payload);
  }

  // Legacy method for backward compatibility - works for guest users
  async addToCartLegacy(product: any, quantity: number = 1, size?: string, color?: string): Promise<boolean> {
    try {
      const productId = product._id || product.id;

      // Try API first, but fallback to local storage for guest users
      try {
        const response = await this.addToCart(productId, quantity, size, color).toPromise();
        if (response?.success) {
          await this.showToast('Item added to cart', 'success');
          this.loadCart(); // Refresh cart
          return true;
        }
      } catch (apiError) {
        console.log('API not available, using local storage');
      }

      // Fallback to local storage (for guest users)
      const cartItem: CartItem = {
        _id: `${productId}_${size || 'default'}_${color || 'default'}`,
        product: {
          _id: productId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images || [],
          brand: product.brand || '',
          discount: product.discount
        },
        quantity,
        size,
        color,
        addedAt: new Date()
      };

      const currentCart = this.cartItems.value;
      const existingItemIndex = currentCart.findIndex(item =>
        item.product._id === productId &&
        (item.size || 'default') === (size || 'default') &&
        (item.color || 'default') === (color || 'default')
      );

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push(cartItem);
      }

      this.cartItems.next(currentCart);
      this.updateCartCount();
      await this.saveCartToStorage();
      await this.showToast('Item added to cart', 'success');
      return true;

    } catch (error) {
      console.error('Error adding to cart:', error);
      await this.showToast('Failed to add item to cart', 'danger');
      return false;
    }
  }

  // Remove item from cart via API
  removeFromCart(itemId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/cart/${itemId}`);
  }

  // Legacy method
  async removeFromCartLegacy(itemId: string): Promise<void> {
    try {
      const response = await this.removeFromCart(itemId).toPromise();
      if (response?.success) {
        await this.showToast('Item removed from cart', 'success');
        this.loadCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      await this.showToast('Failed to remove item from cart', 'danger');
    }
  }

  // Update cart item quantity via API
  updateCartItem(itemId: string, quantity: number): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.API_URL}/cart/${itemId}`, { quantity });
  }

  // Legacy method
  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCartLegacy(itemId);
        return;
      }

      const response = await this.updateCartItem(itemId, quantity).toPromise();
      if (response?.success) {
        this.loadCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      await this.showToast('Failed to update quantity', 'danger');
    }
  }

  // Clear cart via API
  clearCartAPI(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/cart`);
  }

  async clearCart(): Promise<void> {
    try {
      const response = await this.clearCartAPI().toPromise();
      if (response?.success) {
        this.cartItems.next([]);
        this.cartSummary.next(null);
        this.updateCartCount();
        await this.showToast('Cart cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      await this.showToast('Failed to clear cart', 'danger');
    }
  }

  getCartTotal(): number {
    const summary = this.cartSummary.value;
    if (summary) {
      return summary.total;
    }

    // Fallback calculation
    return this.cartItems.value.reduce((total, item) => {
      const price = item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  getCartItemCount(): number {
    return this.cartItemCount.value;
  }

  isInCart(productId: string, size?: string, color?: string): boolean {
    return this.cartItems.value.some(item =>
      item.product._id === productId &&
      (item.size || 'default') === (size || 'default') &&
      (item.color || 'default') === (color || 'default')
    );
  }

  getCartItem(productId: string, size?: string, color?: string): CartItem | undefined {
    return this.cartItems.value.find(item =>
      item.product._id === productId &&
      (item.size || 'default') === (size || 'default') &&
      (item.color || 'default') === (color || 'default')
    );
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
