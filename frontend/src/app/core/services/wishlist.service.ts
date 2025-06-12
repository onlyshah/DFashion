import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
    brand: string;
    discount: number;
    rating: {
      average: number;
      count: number;
    };
    analytics: {
      views: number;
      likes: number;
    };
  };
  addedAt: Date;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = environment.apiUrl;
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  private wishlistCountSubject = new BehaviorSubject<number>(0);

  public wishlistItems$ = this.wishlistItemsSubject.asObservable();
  public wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadWishlist();
  }

  getWishlist(page: number = 1, limit: number = 12): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(`${this.API_URL}/wishlist?page=${page}&limit=${limit}`).pipe(
      tap(response => {
        if (response.success) {
          this.wishlistItemsSubject.next(response.data.items);
          this.wishlistCountSubject.next(response.data.pagination.totalItems);
        }
      })
    );
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/wishlist`, {
      productId
    }).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after adding
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/wishlist/${productId}`).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after removing
      })
    );
  }

  clearWishlist(): Observable<any> {
    return this.http.delete(`${this.API_URL}/wishlist`).pipe(
      tap(() => {
        this.wishlistItemsSubject.next([]);
        this.wishlistCountSubject.next(0);
      })
    );
  }

  moveToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/wishlist/move-to-cart/${productId}`, {
      quantity,
      size,
      color
    }).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after moving
      })
    );
  }

  getWishlistCount(): number {
    return this.wishlistCountSubject.value;
  }

  isInWishlist(productId: string): boolean {
    const items = this.wishlistItemsSubject.value;
    return items.some(item => item.product._id === productId);
  }

  toggleWishlist(productId: string): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  private loadWishlist(): void {
    this.getWishlist().subscribe({
      next: (response) => {
        // Wishlist is already updated in the tap operator
      },
      error: (error) => {
        console.error('Failed to load wishlist:', error);
        // Use localStorage as fallback
        this.loadWishlistFromLocalStorage();
      }
    });
  }

  private loadWishlistFromLocalStorage(): void {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const wishlistData = JSON.parse(savedWishlist);
        this.wishlistItemsSubject.next(wishlistData.items || []);
        this.wishlistCountSubject.next(wishlistData.items?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }

  // Fallback methods for offline functionality
  addToWishlistOffline(product: any): void {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      let wishlistData = savedWishlist ? JSON.parse(savedWishlist) : { items: [] };

      const existingItem = wishlistData.items.find((item: any) => item.product._id === product._id);

      if (!existingItem) {
        wishlistData.items.push({
          _id: Date.now().toString(),
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            images: product.images,
            brand: product.brand,
            discount: product.discount,
            rating: product.rating,
            analytics: product.analytics
          },
          addedAt: new Date()
        });

        localStorage.setItem('wishlist', JSON.stringify(wishlistData));
        this.wishlistItemsSubject.next(wishlistData.items);
        this.wishlistCountSubject.next(wishlistData.items.length);
      }
    } catch (error) {
      console.error('Failed to add to wishlist offline:', error);
    }
  }

  removeFromWishlistOffline(productId: string): void {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        let wishlistData = JSON.parse(savedWishlist);
        wishlistData.items = wishlistData.items.filter((item: any) => item.product._id !== productId);

        localStorage.setItem('wishlist', JSON.stringify(wishlistData));
        this.wishlistItemsSubject.next(wishlistData.items);
        this.wishlistCountSubject.next(wishlistData.items.length);
      }
    } catch (error) {
      console.error('Failed to remove from wishlist offline:', error);
    }
  }

  toggleWishlistOffline(product: any): void {
    if (this.isInWishlist(product._id)) {
      this.removeFromWishlistOffline(product._id);
    } else {
      this.addToWishlistOffline(product);
    }
  }

  // Sync with server when online
  syncWithServer(): Observable<any> {
    return this.getWishlist().pipe(
      tap(response => {
        if (response.success) {
          // Update localStorage with server data
          localStorage.setItem('wishlist', JSON.stringify({
            items: response.data.items
          }));
        }
      })
    );
  }
}
