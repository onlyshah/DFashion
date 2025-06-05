import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product, ProductsResponse, ProductFilters } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.API_URL}/products`, { params });
  }

  getProduct(id: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${this.API_URL}/products/${id}`);
  }

  createProduct(productData: any): Observable<{ message: string; product: Product }> {
    return this.http.post<{ message: string; product: Product }>(`${this.API_URL}/products`, productData);
  }

  updateProduct(id: string, productData: any): Observable<{ message: string; product: Product }> {
    return this.http.put<{ message: string; product: Product }>(`${this.API_URL}/products/${id}`, productData);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/products/${id}`);
  }

  addReview(productId: string, reviewData: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/products/${productId}/review`, reviewData);
  }

  getFeaturedProducts(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(`${this.API_URL}/products/featured`);
  }

  getTrendingProducts(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(`${this.API_URL}/products/trending`);
  }

  getVendorProducts(vendorId: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.API_URL}/products/vendor/${vendorId}`, { params });
  }

  searchProducts(query: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  getCategories(): Observable<{ categories: string[] }> {
    return this.http.get<{ categories: string[] }>(`${this.API_URL}/products/categories`);
  }

  getBrands(): Observable<{ brands: string[] }> {
    return this.http.get<{ brands: string[] }>(`${this.API_URL}/products/brands`);
  }
}
