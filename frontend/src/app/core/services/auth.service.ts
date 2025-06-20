import { Injectable, Inject, forwardRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';

import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: (response) => {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        },
        error: () => {
          // Clear invalid token without redirecting
          this.clearAuth();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);

          // Trigger cart and wishlist refresh after successful login
          this.refreshUserDataOnLogin();
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }





  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }



  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Clear cart and wishlist data on logout
    this.clearUserDataOnLogout();
  }

  // Method to refresh user data (cart, wishlist) after login
  private refreshUserDataOnLogin(): void {
    // Use setTimeout to avoid circular dependency issues
    setTimeout(() => {
      try {
        // Import services dynamically to avoid circular dependency
        import('./cart.service').then(({ CartService }) => {
          const cartService = new CartService(this.http, null as any, null as any);
          cartService.refreshCartOnLogin();
        });

        import('./wishlist-new.service').then(({ WishlistNewService }) => {
          const wishlistService = new WishlistNewService(this.http, this);
          wishlistService.refreshWishlistOnLogin();
        });
      } catch (error) {
        console.error('Error refreshing user data on login:', error);
      }
    }, 100);
  }

  // Method to clear user data on logout
  private clearUserDataOnLogout(): void {
    setTimeout(() => {
      try {
        // Import services dynamically to avoid circular dependency
        import('./cart.service').then(({ CartService }) => {
          const cartService = new CartService(this.http, null as any, null as any);
          cartService.clearCartOnLogout();
        });

        import('./wishlist-new.service').then(({ WishlistNewService }) => {
          const wishlistService = new WishlistNewService(this.http, this);
          wishlistService.clearWishlistOnLogout();
        });
      } catch (error) {
        console.error('Error clearing user data on logout:', error);
      }
    }, 100);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/auth/me`);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'admin';
  }

  isVendor(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'vendor';
  }

  isCustomer(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'customer';
  }

  // Helper methods for checking authentication before actions
  requireAuth(action: string = 'perform this action'): boolean {
    if (!this.isAuthenticated) {
      this.showLoginPrompt(action);
      return false;
    }
    return true;
  }

  requireSuperAdminAuth(action: string = 'perform this action'): boolean {
    if (!this.isAuthenticated) {
      this.showLoginPrompt(action);
      return false;
    }

    if (!this.isAdmin()) {
      this.showRoleError('super admin', action);
      return false;
    }

    return true;
  }

  requireCustomerAuth(action: string = 'perform this action'): boolean {
    if (!this.isAuthenticated) {
      this.showLoginPrompt(action);
      return false;
    }

    if (!this.isCustomer()) {
      this.showRoleError('customer', action);
      return false;
    }

    return true;
  }

  private showLoginPrompt(action: string): void {
    const message = `Please login to ${action}`;
    if (confirm(`${message}. Would you like to login now?`)) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  private showRoleError(requiredRole: string, action: string): void {
    alert(`Only ${requiredRole}s can ${action}. Please login with a ${requiredRole} account.`);
  }

  // Social interaction methods with authentication checks
  canLike(): boolean {
    return this.requireCustomerAuth('like posts');
  }

  canComment(): boolean {
    return this.requireCustomerAuth('comment on posts');
  }

  canAddToCart(): boolean {
    return this.requireCustomerAuth('add items to cart');
  }

  canAddToWishlist(): boolean {
    return this.requireCustomerAuth('add items to wishlist');
  }

  canBuy(): boolean {
    return this.requireCustomerAuth('purchase items');
  }

  // Get auth headers for API calls
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
