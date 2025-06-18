import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface RecommendationProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  category: string;
  subcategory: string;
  brand: string;
  rating: { average: number; count: number };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  recommendationScore?: number;
  recommendationReason?: string;
}

export interface TrendingProduct extends RecommendationProduct {
  trendingScore: number;
  trendingReason: string;
  viewCount: number;
  purchaseCount: number;
  shareCount: number;
  engagementRate: number;
}

export interface UserAnalytics {
  userId: string;
  viewHistory: Array<{
    productId: string;
    category: string;
    timestamp: Date;
    duration: number;
  }>;
  searchHistory: Array<{
    query: string;
    category?: string;
    timestamp: Date;
    resultsClicked: number;
  }>;
  purchaseHistory: Array<{
    productId: string;
    category: string;
    price: number;
    timestamp: Date;
  }>;
  wishlistItems: string[];
  cartItems: string[];
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  brandPreferences: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:5000/api';
  private userAnalytics$ = new BehaviorSubject<UserAnalytics | null>(null);

  constructor(private http: HttpClient) {}

  // Suggested for You - Personalized Recommendations
  getSuggestedProducts(userId?: string, limit: number = 10): Observable<RecommendationProduct[]> {
    // For demo purposes, return fallback data immediately to avoid API calls
    console.log('🎯 Loading suggested products (offline mode)');
    return this.getFallbackSuggestedProducts(limit);

    /* API version - uncomment when backend is available
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/recommendations/suggested?${params.toString()}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching suggested products:', error);
          return this.getFallbackSuggestedProducts(limit);
        })
      );
    */
  }

  // Trending Products - Based on Analytics
  getTrendingProducts(category?: string, limit: number = 10): Observable<TrendingProduct[]> {
    // For demo purposes, return fallback data immediately to avoid API calls
    console.log('📈 Loading trending products (offline mode)');
    return this.getFallbackTrendingProducts(limit);

    /* API version - uncomment when backend is available
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/recommendations/trending?${params.toString()}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching trending products:', error);
          return this.getFallbackTrendingProducts(limit);
        })
      );
    */
  }

  // Similar Products - Based on Product
  getSimilarProducts(productId: string, limit: number = 6): Observable<RecommendationProduct[]> {
    return this.http.get<any>(`${this.apiUrl}/recommendations/similar/${productId}?limit=${limit}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching similar products:', error);
          return this.getFallbackSimilarProducts(limit);
        })
      );
  }

  // Recently Viewed Products
  getRecentlyViewed(userId: string, limit: number = 8): Observable<RecommendationProduct[]> {
    return this.http.get<any>(`${this.apiUrl}/recommendations/recent/${userId}?limit=${limit}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching recently viewed:', error);
          return this.getFallbackRecentProducts(limit);
        })
      );
  }

  // Track User Behavior for Analytics
  trackProductView(productId: string, category: string, duration: number = 0): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/track-view`, {
      productId,
      category,
      duration,
      timestamp: new Date()
    }).pipe(
      catchError(error => {
        console.error('Error tracking product view:', error);
        return [];
      })
    );
  }

  trackSearch(query: string, category?: string, resultsClicked: number = 0): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/track-search`, {
      query,
      category,
      resultsClicked,
      timestamp: new Date()
    }).pipe(
      catchError(error => {
        console.error('Error tracking search:', error);
        return [];
      })
    );
  }

  trackPurchase(productId: string, category: string, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/track-purchase`, {
      productId,
      category,
      price,
      timestamp: new Date()
    }).pipe(
      catchError(error => {
        console.error('Error tracking purchase:', error);
        return [];
      })
    );
  }

  // User Analytics
  getUserAnalytics(userId: string): Observable<UserAnalytics> {
    return this.http.get<any>(`${this.apiUrl}/analytics/user/${userId}`)
      .pipe(
        map(response => response.success ? response.data : this.getDefaultAnalytics(userId)),
        catchError(error => {
          console.error('Error fetching user analytics:', error);
          return [this.getDefaultAnalytics(userId)];
        })
      );
  }

  // Category-based Recommendations
  getCategoryRecommendations(category: string, limit: number = 8): Observable<RecommendationProduct[]> {
    // For demo purposes, return fallback data immediately to avoid API calls
    console.log(`🏷️ Loading ${category} recommendations (offline mode)`);
    return this.getFallbackCategoryProducts(category, limit);

    /* API version - uncomment when backend is available
    return this.http.get<any>(`${this.apiUrl}/recommendations/category/${category}?limit=${limit}`)
      .pipe(
        map(response => response.success ? response.data : []),
        catchError(error => {
          console.error('Error fetching category recommendations:', error);
          return this.getFallbackCategoryProducts(category, limit);
        })
      );
    */
  }

  // Fallback methods for offline/error scenarios
  private getFallbackSuggestedProducts(limit: number): Observable<RecommendationProduct[]> {
    // Return mock suggested products based on popular items
    const mockProducts: RecommendationProduct[] = [
      {
        _id: 'suggested-1',
        name: 'Trending Cotton T-Shirt',
        description: 'Popular cotton t-shirt based on your preferences',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', alt: 'Cotton T-Shirt', isPrimary: true }],
        category: 'men',
        subcategory: 'shirts',
        brand: 'ComfortWear',
        rating: { average: 4.2, count: 156 },
        tags: ['cotton', 'casual', 'trending'],
        isActive: true,
        isFeatured: true,
        recommendationScore: 0.85,
        recommendationReason: 'Based on your recent views'
      }
    ];
    return new Observable(observer => {
      observer.next(mockProducts.slice(0, limit));
      observer.complete();
    });
  }

  private getFallbackTrendingProducts(limit: number): Observable<TrendingProduct[]> {
    const mockTrending: TrendingProduct[] = [
      {
        _id: 'trending-1',
        name: 'Viral Summer Dress',
        description: 'This dress is trending across social media',
        price: 2499,
        originalPrice: 3499,
        discount: 29,
        images: [{ url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', alt: 'Summer Dress', isPrimary: true }],
        category: 'women',
        subcategory: 'dresses',
        brand: 'StyleHub',
        rating: { average: 4.5, count: 89 },
        tags: ['summer', 'trending', 'viral'],
        isActive: true,
        isFeatured: true,
        trendingScore: 0.92,
        trendingReason: 'Viral on social media',
        viewCount: 15420,
        purchaseCount: 342,
        shareCount: 1250,
        engagementRate: 8.7
      },
      {
        _id: 'trending-2',
        name: 'Trending Casual T-Shirt',
        description: 'Popular casual wear for everyday comfort',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', alt: 'Casual T-Shirt', isPrimary: true }],
        category: 'men',
        subcategory: 'shirts',
        brand: 'ComfortWear',
        rating: { average: 4.2, count: 156 },
        tags: ['casual', 'trending', 'comfort'],
        isActive: true,
        isFeatured: true,
        trendingScore: 0.85,
        trendingReason: 'High demand this week',
        viewCount: 12300,
        purchaseCount: 287,
        shareCount: 890,
        engagementRate: 7.4
      },
      {
        _id: 'trending-3',
        name: 'Stylish Ethnic Kurta',
        description: 'Traditional wear with modern styling',
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', alt: 'Ethnic Kurta', isPrimary: true }],
        category: 'women',
        subcategory: 'ethnic',
        brand: 'EthnicChic',
        rating: { average: 4.6, count: 203 },
        tags: ['ethnic', 'traditional', 'festive'],
        isActive: true,
        isFeatured: true,
        trendingScore: 0.88,
        trendingReason: 'Festival season favorite',
        viewCount: 9800,
        purchaseCount: 198,
        shareCount: 567,
        engagementRate: 8.1
      }
    ];
    return new Observable(observer => {
      observer.next(mockTrending.slice(0, limit));
      observer.complete();
    });
  }

  private getFallbackSimilarProducts(limit: number): Observable<RecommendationProduct[]> {
    return this.getFallbackSuggestedProducts(limit);
  }

  private getFallbackRecentProducts(limit: number): Observable<RecommendationProduct[]> {
    return this.getFallbackSuggestedProducts(limit);
  }

  private getFallbackCategoryProducts(category: string, limit: number): Observable<RecommendationProduct[]> {
    return this.getFallbackSuggestedProducts(limit);
  }

  private getDefaultAnalytics(userId: string): UserAnalytics {
    return {
      userId,
      viewHistory: [],
      searchHistory: [],
      purchaseHistory: [],
      wishlistItems: [],
      cartItems: [],
      preferredCategories: ['women', 'men', 'accessories'],
      priceRange: { min: 500, max: 5000 },
      brandPreferences: []
    };
  }

  // Update user analytics locally
  updateUserAnalytics(analytics: UserAnalytics): void {
    this.userAnalytics$.next(analytics);
  }

  // Get current user analytics
  getCurrentUserAnalytics(): Observable<UserAnalytics | null> {
    return this.userAnalytics$.asObservable();
  }
}
