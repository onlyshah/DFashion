import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-analytics',
  template: `
    <div class="analytics-container">
      <div class="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div class="period-selector">
          <mat-form-field appearance="outline">
            <mat-label>Time Period</mat-label>
            <mat-select [(value)]="selectedPeriod" (selectionChange)="onPeriodChange()">
              <mat-option *ngFor="let period of periods" [value]="period.value">
                {{ period.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <mat-card class="metric-card sales">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="metric-details">
                <h3>₹{{ totalRevenue | number:'1.0-0' }}</h3>
                <p>Total Revenue</p>
                <span class="metric-change positive">+{{ revenueGrowth }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card orders">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="metric-details">
                <h3>{{ totalOrders | number }}</h3>
                <p>Total Orders</p>
                <span class="metric-change positive">+{{ orderGrowth }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card customers">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="metric-details">
                <h3>{{ totalCustomers | number }}</h3>
                <p>Total Customers</p>
                <span class="metric-change positive">+{{ customerGrowth }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card conversion">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-icon">
                <mat-icon>analytics</mat-icon>
              </div>
              <div class="metric-details">
                <h3>{{ conversionRate }}%</h3>
                <p>Conversion Rate</p>
                <span class="metric-change neutral">{{ conversionChange }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Sales Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Sales Overview</mat-card-title>
            <mat-card-subtitle>Revenue and orders over time</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>show_chart</mat-icon>
              <p>Sales chart will be displayed here</p>
              <small>Chart.js integration pending</small>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Top Products -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Top Products</mat-card-title>
            <mat-card-subtitle>Best performing products</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="top-products-list">
              <div *ngFor="let product of topProducts; let i = index" class="product-item">
                <div class="product-rank">{{ i + 1 }}</div>
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-stats">{{ product.sales }} sales • ₹{{ product.revenue | number }}</div>
                </div>
                <div class="product-trend">
                  <mat-icon [color]="product.trend > 0 ? 'primary' : 'warn'">
                    {{ product.trend > 0 ? 'trending_up' : 'trending_down' }}
                  </mat-icon>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Customer Analytics -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Customer Insights</mat-card-title>
            <mat-card-subtitle>Customer behavior and demographics</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="customer-insights">
              <div class="insight-item">
                <div class="insight-label">New Customers</div>
                <div class="insight-value">{{ newCustomers }}</div>
                <div class="insight-change positive">+{{ newCustomerGrowth }}%</div>
              </div>
              <div class="insight-item">
                <div class="insight-label">Returning Customers</div>
                <div class="insight-value">{{ returningCustomers }}</div>
                <div class="insight-change positive">+{{ returningCustomerGrowth }}%</div>
              </div>
              <div class="insight-item">
                <div class="insight-label">Average Order Value</div>
                <div class="insight-value">₹{{ averageOrderValue | number }}</div>
                <div class="insight-change neutral">{{ aovChange }}%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Traffic Sources -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Traffic Sources</mat-card-title>
            <mat-card-subtitle>Where your customers come from</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="traffic-sources">
              <div *ngFor="let source of trafficSources" class="source-item">
                <div class="source-info">
                  <div class="source-name">{{ source.name }}</div>
                  <div class="source-percentage">{{ source.percentage }}%</div>
                </div>
                <div class="source-bar">
                  <div class="source-fill" [style.width.%]="source.percentage"></div>
                </div>
                <div class="source-visitors">{{ source.visitors | number }} visitors</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Export Options -->
      <div class="export-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Export Reports</mat-card-title>
            <mat-card-subtitle>Download analytics data</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="export-buttons">
              <button mat-raised-button color="primary" (click)="exportReport('sales')">
                <mat-icon>file_download</mat-icon>
                Sales Report
              </button>
              <button mat-raised-button color="accent" (click)="exportReport('customers')">
                <mat-icon>file_download</mat-icon>
                Customer Report
              </button>
              <button mat-raised-button (click)="exportReport('products')">
                <mat-icon>file_download</mat-icon>
                Product Report
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedPeriod = '30d';
  periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '12m', label: 'Last 12 months' }
  ];

  // Mock data
  totalRevenue = 125000;
  revenueGrowth = 12.5;
  totalOrders = 2340;
  orderGrowth = 8.3;
  totalCustomers = 1250;
  customerGrowth = 15.2;
  conversionRate = 3.2;
  conversionChange = 0.5;

  newCustomers = 185;
  newCustomerGrowth = 22;
  returningCustomers = 1065;
  returningCustomerGrowth = 12;
  averageOrderValue = 2850;
  aovChange = 5.2;

  topProducts = [
    { name: 'Classic White Shirt', sales: 45, revenue: 112500, trend: 1 },
    { name: 'Denim Jeans', sales: 38, revenue: 95000, trend: 1 },
    { name: 'Summer Dress', sales: 32, revenue: 80000, trend: -1 },
    { name: 'Casual Sneakers', sales: 28, revenue: 70000, trend: 1 },
    { name: 'Leather Jacket', sales: 22, revenue: 55000, trend: -1 }
  ];

  trafficSources = [
    { name: 'Direct', percentage: 35, visitors: 4200 },
    { name: 'Google Search', percentage: 28, visitors: 3360 },
    { name: 'Social Media', percentage: 18, visitors: 2160 },
    { name: 'Email Marketing', percentage: 12, visitors: 1440 },
    { name: 'Referrals', percentage: 7, visitors: 840 }
  ];

  constructor(
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPeriodChange(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    // In a real app, this would load data from the analytics service
    console.log('Loading analytics data for period:', this.selectedPeriod);
  }

  exportReport(type: string): void {
    console.log('Exporting report:', type);
    // Implement export functionality
  }
}
