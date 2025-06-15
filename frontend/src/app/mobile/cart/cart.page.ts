import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cartItems: any[] = [];
  cartSummary: any = null;
  isLoading = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCart();
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartService.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
  }

  ionViewWillEnter() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems = response.cart?.items || [];
          this.cartSummary = response.summary;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
      }
    });
  }

  async updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return;

    this.cartService.updateCartItem(itemId, newQuantity).subscribe({
      next: () => {
        this.presentToast('Quantity updated', 'success');
        this.loadCart(); // Refresh cart
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.presentToast('Failed to update quantity', 'danger');
      }
    });
  }

  async removeItem(item: any) {
    const alert = await this.alertController.create({
      header: 'Remove Item',
      message: `Remove ${item.product.name} from cart?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            this.cartService.removeFromCart(item._id).subscribe({
              next: () => {
                this.presentToast('Item removed from cart', 'success');
                this.loadCart(); // Refresh cart
              },
              error: (error) => {
                console.error('Error removing item:', error);
                this.presentToast('Failed to remove item', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear All',
          handler: () => {
            this.cartService.clearCartAPI().subscribe({
              next: () => {
                this.presentToast('Cart cleared', 'success');
                this.loadCart(); // Refresh cart
              },
              error: (error) => {
                console.error('Error clearing cart:', error);
                this.presentToast('Failed to clear cart', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getTax(): number {
    return this.cartSummary ? Math.round(this.cartSummary.subtotal * 0.18) : 0;
  }

  getShipping(): number {
    return this.cartSummary && this.cartSummary.subtotal >= 500 ? 0 : 50;
  }

  getTotal(): number {
    if (!this.cartSummary) return 0;
    return this.cartSummary.subtotal + this.getTax() + this.getShipping() - (this.cartSummary.discount || 0);
  }

  getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || '/assets/images/placeholder.jpg';
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      this.presentToast('Your cart is empty', 'warning');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/tabs/home']);
  }

  doRefresh(event: any) {
    this.loadCart();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  async presentToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
