import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="create-product-container">
      <div class="header">
        <h1>Create New Product</h1>
        <p>Add a new product to your catalog</p>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label for="name">Product Name *</label>
            <input type="text" id="name" formControlName="name" placeholder="Enter product name">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="brand">Brand</label>
              <input type="text" id="brand" formControlName="brand" placeholder="Brand name">
            </div>
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" formControlName="category">
                <option value="">Select category</option>
                <option value="clothing">Clothing</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="bags">Bags</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea id="description" formControlName="description" rows="4" placeholder="Describe your product..."></textarea>
          </div>
        </div>

        <!-- Pricing -->
        <div class="form-section">
          <h3>Pricing</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="price">Selling Price *</label>
              <input type="number" id="price" formControlName="price" placeholder="0">
            </div>
            <div class="form-group">
              <label for="originalPrice">Original Price</label>
              <input type="number" id="originalPrice" formControlName="originalPrice" placeholder="0">
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="form-section">
          <h3>Product Images</h3>
          
          <div class="image-upload">
            <div class="upload-area" (click)="fileInput.click()">
              <input #fileInput type="file" multiple accept="image/*" (change)="onFileSelect($event)" style="display: none;">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Click to upload images</p>
              <span>Support: JPG, PNG (Max 5 images)</span>
            </div>

            <div class="image-preview" *ngIf="selectedImages.length > 0">
              <div class="image-item" *ngFor="let image of selectedImages; let i = index">
                <img [src]="image.preview" [alt]="'Image ' + (i + 1)">
                <button type="button" class="remove-image" (click)="removeImage(i)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Variants -->
        <div class="form-section">
          <h3>Product Variants</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label>Available Sizes</label>
              <div class="checkbox-group">
                <label *ngFor="let size of availableSizes">
                  <input type="checkbox" [value]="size" (change)="onSizeChange($event)">
                  {{ size }}
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>Available Colors</label>
              <div class="color-group">
                <label *ngFor="let color of availableColors" class="color-option">
                  <input type="checkbox" [value]="color.value" (change)="onColorChange($event)">
                  <span class="color-swatch" [style.background-color]="color.value"></span>
                  {{ color.name }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory -->
        <div class="form-section">
          <h3>Inventory</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="stock">Stock Quantity *</label>
              <input type="number" id="stock" formControlName="stock" placeholder="0">
            </div>
            <div class="form-group">
              <label for="sku">SKU</label>
              <input type="text" id="sku" formControlName="sku" placeholder="Product SKU">
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="saveDraft()">Save as Draft</button>
          <button type="submit" class="btn-primary" [disabled]="!productForm.valid || uploading">
            <span *ngIf="uploading">Creating...</span>
            <span *ngIf="!uploading">Create Product</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-product-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header p {
      color: #666;
    }

    .product-form {
      background: white;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #eee;
    }

    .form-section {
      margin-bottom: 30px;
    }

    .form-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .upload-area:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .upload-area i {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 15px;
    }

    .upload-area p {
      font-size: 1.1rem;
      margin-bottom: 5px;
    }

    .upload-area span {
      color: #666;
      font-size: 0.9rem;
    }

    .image-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .color-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .color-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .color-swatch {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ddd;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CreateProductComponent implements OnInit {
  productForm: FormGroup;
  selectedImages: any[] = [];
  selectedSizes: string[] = [];
  selectedColors: string[] = [];
  uploading = false;

  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  availableColors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#008000' },
    { name: 'Yellow', value: '#FFFF00' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      brand: [''],
      category: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      originalPrice: [''],
      stock: ['', [Validators.required, Validators.min(0)]],
      sku: ['']
    });
  }

  ngOnInit() {}

  onFileSelect(event: any) {
    const files = Array.from(event.target.files);
    files.forEach((file: any) => {
      if (this.selectedImages.length < 5) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push({
            file,
            preview: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  onSizeChange(event: any) {
    const size = event.target.value;
    if (event.target.checked) {
      this.selectedSizes.push(size);
    } else {
      this.selectedSizes = this.selectedSizes.filter(s => s !== size);
    }
  }

  onColorChange(event: any) {
    const color = event.target.value;
    if (event.target.checked) {
      this.selectedColors.push(color);
    } else {
      this.selectedColors = this.selectedColors.filter(c => c !== color);
    }
  }

  saveDraft() {
    console.log('Saving as draft...');
    alert('Draft saved successfully!');
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.uploading = true;

      const productData = {
        ...this.productForm.value,
        images: this.selectedImages.map(img => ({ url: img.preview })),
        sizes: this.selectedSizes,
        colors: this.selectedColors
      };

      // TODO: Implement actual product creation API
      console.log('Creating product:', productData);

      // Simulate API call
      setTimeout(() => {
        this.uploading = false;
        alert('Product created successfully!');
        this.router.navigate(['/vendor/products']);
      }, 2000);
    }
  }
}
