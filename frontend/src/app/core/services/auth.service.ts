import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
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
          // If backend is not running, use mock user for demo
          this.setMockUser();
        }
      });
    } else {
      // For demo purposes, set a mock user
      this.setMockUser();
    }
  }

  private setMockUser(): void {
    const mockUser: User = {
      _id: '1',
      username: 'fashionista_maya',
      email: 'maya@example.com',
      fullName: 'Maya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      bio: 'Fashion enthusiast and style blogger',
      role: 'customer',
      isVerified: true,
      isActive: true,
      followers: ['2', '3'],
      following: ['2', '4'],
      socialStats: {
        postsCount: 12,
        followersCount: 1250,
        followingCount: 890
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.currentUserSubject.next(mockUser);
    this.isAuthenticatedSubject.next(true);
    this.setToken('mock-token-for-demo');
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.log('Backend not available, using demo login');
          // If backend is not available, simulate login for demo
          return this.simulateLogin(credentials);
        })
      );
  }

  private simulateLogin(credentials: LoginRequest): Observable<AuthResponse> {
    // Demo accounts
    const demoAccounts = [
      {
        email: 'maya@example.com',
        password: 'password123',
        user: {
          _id: '1',
          username: 'fashionista_maya',
          email: 'maya@example.com',
          fullName: 'Maya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          bio: 'Fashion enthusiast and style blogger',
          role: 'customer' as const,
          isVerified: true,
          isActive: true,
          followers: ['2', '3'],
          following: ['2', '4'],
          socialStats: {
            postsCount: 12,
            followersCount: 1250,
            followingCount: 890
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        email: 'raj@example.com',
        password: 'password123',
        user: {
          _id: '2',
          username: 'style_guru_raj',
          email: 'raj@example.com',
          fullName: 'Raj Patel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          bio: 'Style guru and fashion vendor',
          role: 'vendor' as const,
          isVerified: true,
          isActive: true,
          followers: ['1'],
          following: ['3', '4'],
          socialStats: {
            postsCount: 45,
            followersCount: 5600,
            followingCount: 234
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        email: 'admin@dfashion.com',
        password: 'admin123',
        user: {
          _id: '3',
          username: 'admin',
          email: 'admin@dfashion.com',
          fullName: 'DFashion Admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          bio: 'Platform administrator',
          role: 'admin' as const,
          isVerified: true,
          isActive: true,
          followers: [],
          following: [],
          socialStats: {
            postsCount: 0,
            followersCount: 0,
            followingCount: 0
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ];

    const account = demoAccounts.find(acc =>
      acc.email === credentials.email && acc.password === credentials.password
    );

    if (account) {
      const response: AuthResponse = {
        message: 'Demo login successful',
        token: 'demo-token-' + account.user._id,
        user: account.user
      };

      // Simulate network delay
      return new Observable(observer => {
        setTimeout(() => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          observer.next(response);
          observer.complete();
        }, 1000);
      });
    } else {
      return throwError(() => ({
        error: { message: 'Invalid demo credentials. Try: maya@example.com / password123' }
      }));
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.log('Backend not available, using demo registration');
          return this.simulateRegistration(userData);
        })
      );
  }

  private simulateRegistration(userData: RegisterRequest): Observable<AuthResponse> {
    const newUser = {
      _id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      bio: 'New DFashion user',
      role: userData.role,
      isVerified: false,
      isActive: true,
      followers: [],
      following: [],
      socialStats: {
        postsCount: 0,
        followersCount: 0,
        followingCount: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const response: AuthResponse = {
      message: 'Demo registration successful',
      token: 'demo-token-' + newUser._id,
      user: newUser
    };

    // Simulate network delay
    return new Observable(observer => {
      setTimeout(() => {
        this.setToken(response.token);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
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
}
