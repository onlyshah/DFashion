import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-user-dialog',
  template: `
    <div class="user-dialog">
      <h2 mat-dialog-title>{{ isEditMode ? 'Edit User' : 'Add New User' }}</h2>
      
      <mat-dialog-content>
        <form [formGroup]="userForm" class="user-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" placeholder="Enter full name">
              <mat-error *ngIf="userForm.get('fullName')?.hasError('required')">
                Full name is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Enter email">
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter username">
              <mat-error *ngIf="userForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="!isEditMode">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Enter password">
              <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option *ngFor="let role of roles" [value]="role.value">
                  {{ role.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="userForm.get('role')?.hasError('required')">
                Role is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department">
                <mat-option *ngFor="let dept of departments" [value]="dept.value">
                  {{ dept.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row" *ngIf="showEmployeeFields">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Employee ID</mat-label>
              <input matInput formControlName="employeeId" placeholder="Enter employee ID">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-slide-toggle formControlName="isActive" color="primary">
              Active User
            </mat-slide-toggle>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()"
                [disabled]="userForm.invalid || isLoading">
          <mat-spinner *ngIf="isLoading" diameter="20" class="save-spinner"></mat-spinner>
          {{ isEditMode ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-dialog {
      min-width: 500px;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1rem 0;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .save-spinner {
      margin-right: 0.5rem;
    }

    ::ng-deep .save-spinner circle {
      stroke: white;
    }

    @media (max-width: 600px) {
      .user-dialog {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'account_manager', label: 'Account Manager' },
    { value: 'support_manager', label: 'Support Manager' },
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'marketing_executive', label: 'Marketing Executive' },
    { value: 'account_executive', label: 'Account Executive' },
    { value: 'support_executive', label: 'Support Executive' }
  ];

  departments = [
    { value: 'administration', label: 'Administration' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'support', label: 'Support' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: AdminApiService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data;
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data) {
      this.userForm.patchValue(this.data);
    }
  }

  createForm(): FormGroup {
    const formConfig: any = {
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      role: ['', [Validators.required]],
      department: [''],
      employeeId: [''],
      isActive: [true]
    };

    if (!this.isEditMode) {
      formConfig.password = ['', [Validators.required, Validators.minLength(6)]];
    }

    return this.fb.group(formConfig);
  }

  get showEmployeeFields(): boolean {
    const role = this.userForm.get('role')?.value;
    return role && role !== 'customer' && role !== 'vendor';
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formData = this.userForm.value;

      const apiCall = this.isEditMode 
        ? this.apiService.updateUser(this.data._id, formData)
        : this.apiService.createUser(formData);

      apiCall.subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(
            `User ${this.isEditMode ? 'updated' : 'created'} successfully`, 
            'Close', 
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} user`;
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
