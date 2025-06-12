import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-story',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="create-story-container">
      <div class="header">
        <h1>Create New Story</h1>
        <p>Share a 24-hour story with your products</p>
      </div>

      <form [formGroup]="storyForm" (ngSubmit)="onSubmit()" class="story-form">
        <!-- Media Upload -->
        <div class="form-section">
          <h3>Story Media</h3>
          <div class="media-upload">
            <div class="upload-area" (click)="fileInput.click()" [class.has-media]="selectedMedia">
              <input #fileInput type="file" accept="image/*,video/*" (change)="onFileSelect($event)" style="display: none;">
              
              <div class="upload-content" *ngIf="!selectedMedia">
                <i class="fas fa-camera"></i>
                <p>Upload Image or Video</p>
                <span>Stories disappear after 24 hours</span>
              </div>

              <div class="media-preview" *ngIf="selectedMedia">
                <img *ngIf="selectedMedia.type.startsWith('image')" [src]="selectedMedia.preview" alt="Story preview">
                <video *ngIf="selectedMedia.type.startsWith('video')" [src]="selectedMedia.preview" controls></video>
                <button type="button" class="change-media" (click)="removeMedia()">
                  <i class="fas fa-edit"></i> Change Media
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Caption -->
        <div class="form-section">
          <h3>Caption (Optional)</h3>
          <textarea 
            formControlName="caption" 
            placeholder="Add a caption to your story..."
            rows="3"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ storyForm.get('caption')?.value?.length || 0 }}/500</div>
        </div>

        <!-- Product Tags -->
        <div class="form-section">
          <h3>Tag Products</h3>
          <div class="product-search">
            <input 
              type="text" 
              placeholder="Search your products to tag..."
              (input)="searchProducts($event)"
              class="search-input"
            >
            
            <div class="product-results" *ngIf="searchResults.length > 0">
              <div 
                class="product-item" 
                *ngFor="let product of searchResults"
                (click)="addProductTag(product)"
              >
                <img [src]="product.images[0]?.url" [alt]="product.name">
                <div class="product-info">
                  <h4>{{ product.name }}</h4>
                  <p>₹{{ product.price | number:'1.0-0' }}</p>
                </div>
                <div class="product-actions">
                  <button type="button" class="btn-tag">Tag</button>
                </div>
              </div>
            </div>
          </div>

          <div class="tagged-products" *ngIf="taggedProducts.length > 0">
            <h4>Tagged Products:</h4>
            <div class="tagged-list">
              <div class="tagged-item" *ngFor="let product of taggedProducts; let i = index">
                <img [src]="product.images[0]?.url" [alt]="product.name">
                <div class="product-details">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-price">₹{{ product.price | number:'1.0-0' }}</span>
                </div>
                <div class="product-buttons">
                  <span class="buy-btn">Buy Now</span>
                  <span class="cart-btn">Add to Cart</span>
                  <span class="wishlist-btn">♡ Wishlist</span>
                </div>
                <button type="button" class="remove-tag" (click)="removeProductTag(i)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Story Settings -->
        <div class="form-section">
          <h3>Story Settings</h3>
          <div class="settings-grid">
            <label class="setting-item">
              <input type="checkbox" formControlName="allowReplies">
              <span>Allow replies</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" formControlName="showViewers">
              <span>Show viewers</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" formControlName="highlightProducts">
              <span>Highlight products</span>
            </label>
          </div>
        </div>

        <!-- Story Duration -->
        <div class="form-section">
          <h3>Duration</h3>
          <div class="duration-options">
            <label class="duration-option">
              <input type="radio" name="duration" value="24" formControlName="duration">
              <span>24 Hours (Default)</span>
            </label>
            <label class="duration-option">
              <input type="radio" name="duration" value="12" formControlName="duration">
              <span>12 Hours</span>
            </label>
            <label class="duration-option">
              <input type="radio" name="duration" value="6" formControlName="duration">
              <span>6 Hours</span>
            </label>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="saveDraft()">Save as Draft</button>
          <button type="submit" class="btn-primary" [disabled]="!storyForm.valid || !selectedMedia || uploading">
            <span *ngIf="uploading">Publishing...</span>
            <span *ngIf="!uploading">Publish Story</span>
          </button>
        </div>
      </form>

      <!-- Story Preview -->
      <div class="story-preview" *ngIf="selectedMedia">
        <h3>Preview</h3>
        <div class="preview-container">
          <div class="story-frame">
            <img *ngIf="selectedMedia.type.startsWith('image')" [src]="selectedMedia.preview" alt="Story preview">
            <video *ngIf="selectedMedia.type.startsWith('video')" [src]="selectedMedia.preview" muted></video>
            
            <div class="story-overlay">
              <div class="story-caption" *ngIf="storyForm.get('caption')?.value">
                {{ storyForm.get('caption')?.value }}
              </div>
              
              <div class="story-products" *ngIf="taggedProducts.length > 0">
                <div class="product-tag" *ngFor="let product of taggedProducts">
                  <div class="product-info-popup">
                    <img [src]="product.images[0]?.url" [alt]="product.name">
                    <div class="product-details">
                      <h4>{{ product.name }}</h4>
                      <p>₹{{ product.price | number:'1.0-0' }}</p>
                      <div class="product-actions">
                        <button class="btn-buy">Buy Now</button>
                        <button class="btn-cart">Cart</button>
                        <button class="btn-wishlist">♡</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-story-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 40px;
    }

    .header {
      grid-column: 1 / -1;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header p {
      color: #666;
    }

    .story-form {
      background: white;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #eee;
      height: fit-content;
    }

    .form-section {
      margin-bottom: 25px;
    }

    .form-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-area:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .upload-content i {
      font-size: 2.5rem;
      color: #ddd;
      margin-bottom: 15px;
    }

    .upload-content p {
      font-size: 1.1rem;
      margin-bottom: 5px;
    }

    .upload-content span {
      color: #666;
      font-size: 0.9rem;
    }

    .media-preview {
      position: relative;
      width: 100%;
    }

    .media-preview img,
    .media-preview video {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
    }

    .change-media {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      resize: vertical;
    }

    .char-count {
      text-align: right;
      color: #666;
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .product-results {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 6px;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
    }

    .product-item:hover {
      background: #f8f9fa;
    }

    .product-item img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-info h4 {
      font-size: 0.85rem;
      margin-bottom: 2px;
    }

    .product-info p {
      color: #666;
      font-size: 0.8rem;
    }

    .btn-tag {
      background: #007bff;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .tagged-list {
      margin-top: 10px;
    }

    .tagged-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .tagged-item img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-details {
      flex: 1;
    }

    .product-name {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .product-price {
      color: #666;
      font-size: 0.8rem;
    }

    .product-buttons {
      display: flex;
      gap: 5px;
    }

    .buy-btn, .cart-btn, .wishlist-btn {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 3px;
      background: #e9ecef;
      color: #495057;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .duration-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .duration-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      flex: 1;
    }

    .btn-primary {
      background: #007bff;
      color: white;
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

    .story-preview {
      position: sticky;
      top: 20px;
      height: fit-content;
    }

    .story-preview h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .preview-container {
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 9/16;
      position: relative;
    }

    .story-frame {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .story-frame img,
    .story-frame video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .story-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(transparent 60%, rgba(0,0,0,0.3));
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .story-caption {
      color: white;
      font-size: 0.9rem;
      margin-bottom: 10px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }

    .product-tag {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .product-info-popup {
      background: white;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      min-width: 200px;
    }

    .product-info-popup img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .product-info-popup h4 {
      font-size: 0.85rem;
      margin-bottom: 4px;
    }

    .product-info-popup p {
      color: #666;
      font-size: 0.8rem;
      margin-bottom: 8px;
    }

    .product-actions {
      display: flex;
      gap: 5px;
    }

    .btn-buy, .btn-cart, .btn-wishlist {
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      font-size: 0.7rem;
      cursor: pointer;
    }

    .btn-buy {
      background: #28a745;
      color: white;
    }

    .btn-cart {
      background: #007bff;
      color: white;
    }

    .btn-wishlist {
      background: #f8f9fa;
      color: #666;
    }

    @media (max-width: 768px) {
      .create-story-container {
        grid-template-columns: 1fr;
      }

      .story-preview {
        order: -1;
      }

      .preview-container {
        max-width: 200px;
        margin: 0 auto;
      }
    }
  `]
})
export class CreateStoryComponent implements OnInit {
  storyForm: FormGroup;
  selectedMedia: any = null;
  taggedProducts: any[] = [];
  searchResults: any[] = [];
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.storyForm = this.fb.group({
      caption: ['', [Validators.maxLength(500)]],
      allowReplies: [true],
      showViewers: [true],
      highlightProducts: [true],
      duration: ['24']
    });
  }

  ngOnInit() {}

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedMedia = {
          file,
          preview: e.target.result,
          type: file.type,
          name: file.name
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeMedia() {
    this.selectedMedia = null;
  }

  searchProducts(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      // TODO: Implement actual product search API
      this.searchResults = [
        {
          _id: '1',
          name: 'Summer Dress',
          price: 2999,
          images: [{ url: '/assets/images/product1.jpg' }]
        },
        {
          _id: '2',
          name: 'Casual Shirt',
          price: 1599,
          images: [{ url: '/assets/images/product2.jpg' }]
        }
      ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    } else {
      this.searchResults = [];
    }
  }

  addProductTag(product: any) {
    if (!this.taggedProducts.find(p => p._id === product._id)) {
      this.taggedProducts.push(product);
    }
    this.searchResults = [];
  }

  removeProductTag(index: number) {
    this.taggedProducts.splice(index, 1);
  }

  saveDraft() {
    console.log('Saving as draft...');
  }

  onSubmit() {
    if (this.storyForm.valid && this.selectedMedia) {
      this.uploading = true;
      
      const storyData = {
        media: {
          type: this.selectedMedia.type.startsWith('image') ? 'image' : 'video',
          url: this.selectedMedia.preview // In real implementation, upload to server first
        },
        caption: this.storyForm.value.caption,
        products: this.taggedProducts.map(p => ({
          product: p._id,
          position: { x: 50, y: 50 }
        })),
        settings: {
          allowReplies: this.storyForm.value.allowReplies,
          showViewers: this.storyForm.value.showViewers,
          highlightProducts: this.storyForm.value.highlightProducts
        },
        duration: parseInt(this.storyForm.value.duration)
      };

      // Simulate API call
      setTimeout(() => {
        this.uploading = false;
        alert('Story created successfully!');
        this.router.navigate(['/vendor/stories']);
      }, 2000);
    }
  }
}
