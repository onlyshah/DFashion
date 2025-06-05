import { Routes } from '@angular/router';

export const shopRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent)
  }
];
