import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-story-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="story-create-container">
      <!-- Header -->
      <div class="create-header">
        <button class="btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>Create Story</h2>
        <button class="btn-share" 
                [disabled]="!selectedMedia || uploading"
                (click)="shareStory()">
          {{ uploading ? 'Sharing...' : 'Share' }}
        </button>
      </div>

      <!-- Media Selection -->
      <div class="media-selection" *ngIf="!selectedMedia">
        <div class="selection-options">
          <div class="option-card" (click)="selectFromGallery()">
            <i class="fas fa-images"></i>
            <span>Gallery</span>
          </div>
          
          <div class="option-card" (click)="takePhoto()">
            <i class="fas fa-camera"></i>
            <span>Camera</span>
          </div>
          
          <div class="option-card" (click)="recordVideo()">
            <i class="fas fa-video"></i>
            <span>Video</span>
          </div>
        </div>

        <!-- File Input -->
        <input type="file" 
               #fileInput 
               accept="image/*,video/*" 
               (change)="onFileSelected($event)"
               style="display: none;">
      </div>

      <!-- Media Preview -->
      <div class="media-preview" *ngIf="selectedMedia">
        <!-- Image Preview -->
        <div class="preview-container" *ngIf="mediaType === 'image'">
          <img [src]="mediaPreview" alt="Story preview" class="preview-media">
        </div>

        <!-- Video Preview -->
        <div class="preview-container" *ngIf="mediaType === 'video'">
          <video [src]="mediaPreview" 
                 controls 
                 class="preview-media"
                 #videoPreview>
          </video>
        </div>

        <!-- Story Tools -->
        <div class="story-tools">
          <!-- Text Tool -->
          <div class="tool-section">
            <button class="tool-btn" 
                    [class.active]="activetool === 'text'"
                    (click)="toggleTool('text')">
              <i class="fas fa-font"></i>
            </button>
          </div>

          <!-- Product Tag Tool -->
          <div class="tool-section">
            <button class="tool-btn" 
                    [class.active]="activetool === 'product'"
                    (click)="toggleTool('product')">
              <i class="fas fa-shopping-bag"></i>
            </button>
          </div>

          <!-- Sticker Tool -->
          <div class="tool-section">
            <button class="tool-btn" 
                    [class.active]="activeTools === 'sticker'"
                    (click)="toggleTool('sticker')">
              <i class="fas fa-smile"></i>
            </button>
          </div>
        </div>

        <!-- Caption Input -->
        <div class="caption-section">
          <textarea [(ngModel)]="caption" 
                    placeholder="Write a caption..."
                    class="caption-input"
                    maxlength="500"></textarea>
          <span class="char-count">{{ caption.length }}/500</span>
        </div>

        <!-- Product Selection Modal -->
        <div class="product-modal" *ngIf="showProductModal" (click)="closeProductModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Tag Products</h3>
              <button class="btn-close" (click)="closeProductModal()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="product-search">
              <input type="text" 
                     [(ngModel)]="productSearchQuery"
                     (input)="searchProducts()"
                     placeholder="Search products..."
                     class="search-input">
            </div>
            
            <div class="products-list">
              <div class="product-item" 
                   *ngFor="let product of searchResults"
                   (click)="selectProduct(product)">
                <img [src]="product.images[0]?.url" 
                     [alt]="product.name" 
                     class="product-image">
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-price">₹{{ product.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="uploading">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Sharing your story...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .story-create-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    .create-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(0,0,0,0.8);
      color: #fff;
    }

    .btn-back, .btn-share {
      background: none;
      border: none;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 20px;
      transition: background 0.2s ease;
    }

    .btn-back:hover {
      background: rgba(255,255,255,0.1);
    }

    .btn-share {
      background: #007bff;
      font-weight: 600;
    }

    .btn-share:disabled {
      background: #666;
      cursor: not-allowed;
    }

    .btn-share:not(:disabled):hover {
      background: #0056b3;
    }

    .create-header h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .media-selection {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .selection-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 20px;
      max-width: 400px;
      width: 100%;
    }

    .option-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 30px 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .option-card:hover {
      background: rgba(255,255,255,0.2);
      border-color: #007bff;
      transform: translateY(-4px);
    }

    .option-card i {
      font-size: 2rem;
    }

    .option-card span {
      font-weight: 500;
    }

    .media-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .preview-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .preview-media {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }

    .story-tools {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 16px;
      background: rgba(0,0,0,0.5);
    }

    .tool-btn {
      width: 48px;
      height: 48px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tool-btn:hover,
    .tool-btn.active {
      background: #007bff;
      transform: scale(1.1);
    }

    .caption-section {
      padding: 16px 20px;
      background: rgba(0,0,0,0.8);
      position: relative;
    }

    .caption-input {
      width: 100%;
      min-height: 60px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 12px;
      color: #fff;
      font-size: 0.9rem;
      resize: none;
      outline: none;
    }

    .caption-input::placeholder {
      color: rgba(255,255,255,0.6);
    }

    .char-count {
      position: absolute;
      bottom: 20px;
      right: 24px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.6);
    }

    .product-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: #fff;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px;
    }

    .product-search {
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }

    .search-input:focus {
      border-color: #007bff;
    }

    .products-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    }

    .product-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .product-item:hover {
      background: #f8f9fa;
    }

    .product-image {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-name {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .product-price {
      color: #007bff;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      z-index: 1200;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-content {
      text-align: center;
      color: #fff;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .create-header {
        padding: 12px 16px;
      }

      .create-header h2 {
        font-size: 1.1rem;
      }

      .selection-options {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .option-card {
        padding: 24px 16px;
      }

      .option-card i {
        font-size: 1.8rem;
      }

      .story-tools {
        gap: 12px;
        padding: 12px;
      }

      .tool-btn {
        width: 44px;
        height: 44px;
        font-size: 1.1rem;
      }

      .caption-section {
        padding: 12px 16px;
      }
    }

    @media (max-width: 480px) {
      .selection-options {
        grid-template-columns: 1fr;
        max-width: 200px;
      }

      .option-card {
        padding: 20px;
      }

      .modal-content {
        margin: 10px;
        max-width: calc(100vw - 20px);
      }
    }
  `]
})
export class StoryCreateComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;

  selectedMedia: File | null = null;
  mediaPreview: string = '';
  mediaType: 'image' | 'video' = 'image';
  caption: string = '';
  activeTools: string = '';
  uploading: boolean = false;
  
  showProductModal: boolean = false;
  productSearchQuery: string = '';
  searchResults: any[] = [];
  selectedProducts: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  goBack() {
    this.router.navigate(['/social']);
  }

  selectFromGallery() {
    this.fileInput.nativeElement.click();
  }

  takePhoto() {
    // For web, this will open file picker with camera option
    this.fileInput.nativeElement.setAttribute('capture', 'environment');
    this.fileInput.nativeElement.click();
  }

  recordVideo() {
    // For web, this will open file picker with video option
    this.fileInput.nativeElement.setAttribute('accept', 'video/*');
    this.fileInput.nativeElement.setAttribute('capture', 'camcorder');
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedMedia = file;
      this.mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mediaPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleTool(tool: string) {
    if (this.activeTools === tool) {
      this.activeTools = '';
    } else {
      this.activeTools = tool;
      
      if (tool === 'product') {
        this.showProductModal = true;
        this.searchProducts();
      }
    }
  }

  closeProductModal() {
    this.showProductModal = false;
    this.activeTools = '';
  }

  searchProducts() {
    // Search products from API
    const query = this.productSearchQuery || '';
    fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}&limit=20`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.searchResults = data.products;
        }
      })
      .catch(error => {
        console.error('Error searching products:', error);
      });
  }

  selectProduct(product: any) {
    this.selectedProducts.push(product);
    this.closeProductModal();
    // TODO: Add product tag to story
  }

  shareStory() {
    if (!this.selectedMedia) return;

    this.uploading = true;

    const formData = new FormData();
    formData.append('media', this.selectedMedia);
    formData.append('caption', this.caption);
    formData.append('products', JSON.stringify(this.selectedProducts));

    fetch('http://localhost:5000/api/stories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      this.uploading = false;
      if (data.success) {
        this.router.navigate(['/social']);
      } else {
        alert('Failed to share story. Please try again.');
      }
    })
    .catch(error => {
      this.uploading = false;
      console.error('Error sharing story:', error);
      alert('Failed to share story. Please try again.');
    });
  }
}
