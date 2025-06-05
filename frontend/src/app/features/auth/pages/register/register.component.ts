import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo -->
        <div class="logo">
          <h1 class="gradient-text">DFashion</h1>
          <p>Join the Social E-commerce Revolution</p>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <input
              type="text"
              formControlName="fullName"
              placeholder="Full Name"
              class="form-control"
              [class.error]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
            >
            <div *ngIf="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched" class="error-message">
              Full name is required
            </div>
          </div>

          <div class="form-group">
            <input
              type="text"
              formControlName="username"
              placeholder="Username"
              class="form-control"
              [class.error]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
            >
            <div *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" class="error-message">
              <span *ngIf="registerForm.get('username')?.errors?.['required']">Username is required</span>
              <span *ngIf="registerForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</span>
            </div>
          </div>

          <div class="form-group">
            <input
              type="email"
              formControlName="email"
              placeholder="Email"
              class="form-control"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
            <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="error-message">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <input
              type="password"
              formControlName="password"
              placeholder="Password"
              class="form-control"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
            <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="error-message">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <select formControlName="role" class="form-control">
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <!-- Vendor Info -->
          <div *ngIf="registerForm.get('role')?.value === 'vendor'" class="vendor-info">
            <div class="form-group">
              <input
                type="text"
                formControlName="businessName"
                placeholder="Business Name"
                class="form-control"
              >
            </div>
            <div class="form-group">
              <input
                type="text"
                formControlName="businessType"
                placeholder="Business Type"
                class="form-control"
              >
            </div>
          </div>

          <button 
            type="submit" 
            class="btn-primary auth-btn"
            [disabled]="registerForm.invalid || loading"
          >
            <span *ngIf="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>

        <!-- Login Link -->
        <div class="auth-link">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
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

    .vendor-info {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 20px;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required],
      businessName: [''],
      businessType: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formData = { ...this.registerForm.value };
      
      if (formData.role === 'vendor') {
        formData.vendorInfo = {
          businessName: formData.businessName,
          businessType: formData.businessType
        };
      }

      delete formData.businessName;
      delete formData.businessType;

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
