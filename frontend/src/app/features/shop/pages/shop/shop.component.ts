import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shop-container">
      <h2>Shop Page</h2>
      <p>Shop functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .shop-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class ShopComponent {}
