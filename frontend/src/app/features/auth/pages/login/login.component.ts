import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo -->
        <div class="logo">
          <h1 class="gradient-text">DFashion</h1>
          <p>Social E-commerce Platform</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <input
              type="email"
              formControlName="email"
              placeholder="Email"
              class="form-control"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
            <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error-message">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <input
              type="password"
              formControlName="password"
              placeholder="Password"
              class="form-control"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <button 
            type="submit" 
            class="btn-primary auth-btn"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="loading" class="loading-spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>

        <!-- Demo Accounts -->
        <div class="demo-accounts">
          <h4>Demo Accounts (Backend Not Required)</h4>
          <p class="demo-note">Click to auto-fill credentials or use them manually:</p>
          <div class="demo-buttons">
            <button (click)="loginAsDemo('customer')" class="demo-btn">
              <i class="fas fa-user"></i>
              <div class="demo-info">
                <strong>Customer Demo</strong>
                <small>maya&#64;example.com / password123</small>
              </div>
            </button>
            <button (click)="loginAsDemo('vendor')" class="demo-btn">
              <i class="fas fa-store"></i>
              <div class="demo-info">
                <strong>Vendor Demo</strong>
                <small>raj&#64;example.com / password123</small>
              </div>
            </button>
            <button (click)="loginAsDemo('admin')" class="demo-btn">
              <i class="fas fa-shield-alt"></i>
              <div class="demo-info">
                <strong>Admin Demo</strong>
                <small>admin&#64;dfashion.com / admin123</small>
              </div>
            </button>
          </div>
          <div class="backend-status">
            <p><i class="fas fa-info-circle"></i> Backend not running - using demo mode</p>
          </div>
        </div>

        <!-- Register Link -->
        <div class="auth-link">
          <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    .logo {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .logo p {
      color: #8e8e8e;
      font-size: 14px;
    }

    .auth-form {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }

    .form-control:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 149, 246, 0.1);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .auth-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .demo-accounts {
      margin-bottom: 24px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .demo-accounts h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
      color: #64748b;
    }

    .demo-note {
      font-size: 12px;
      color: #8e8e8e;
      text-align: center;
      margin-bottom: 12px;
    }

    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .demo-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .demo-btn:hover {
      background: #f1f5f9;
      border-color: var(--primary-color);
      transform: translateY(-1px);
    }

    .demo-btn i {
      font-size: 16px;
      color: var(--primary-color);
      min-width: 16px;
    }

    .demo-info {
      flex: 1;
    }

    .demo-info strong {
      display: block;
      font-size: 13px;
      color: #262626;
      margin-bottom: 2px;
    }

    .demo-info small {
      font-size: 11px;
      color: #8e8e8e;
      font-family: monospace;
    }

    .backend-status {
      padding: 8px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 6px;
      text-align: center;
    }

    .backend-status p {
      font-size: 11px;
      color: #92400e;
      margin: 0;
    }

    .backend-status i {
      margin-right: 4px;
    }

    .auth-link {
      text-align: center;
    }

    .auth-link p {
      font-size: 14px;
      color: #8e8e8e;
    }

    .auth-link a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 24px;
      }

      .logo h1 {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.success(
            'Login Successful!',
            `Welcome back, ${response.user.fullName}!`
          );
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid credentials. Try demo accounts below.';
          this.notificationService.error(
            'Login Failed',
            'Please check your credentials or use demo accounts below.'
          );
        }
      });
    }
  }

  loginAsDemo(role: 'customer' | 'vendor' | 'admin') {
    const demoCredentials = {
      customer: { email: 'maya@example.com', password: 'password123' },
      vendor: { email: 'raj@example.com', password: 'password123' },
      admin: { email: 'admin@dfashion.com', password: 'admin123' }
    };

    const credentials = demoCredentials[role];
    this.loginForm.patchValue(credentials);
    this.onSubmit();
  }
}
