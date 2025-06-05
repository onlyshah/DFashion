import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification"
        [class]="'notification-' + notification.type"
        [@slideIn]
      >
        <div class="notification-content">
          <div class="notification-header">
            <i [class]="getIcon(notification.type)"></i>
            <strong>{{ notification.title }}</strong>
            <button 
              class="close-btn" 
              (click)="close(notification.id)"
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    }

    .notification {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      border-left: 4px solid #10b981;
    }

    .notification-error {
      border-left: 4px solid #ef4444;
    }

    .notification-info {
      border-left: 4px solid #3b82f6;
    }

    .notification-warning {
      border-left: 4px solid #f59e0b;
    }

    .notification-content {
      padding: 16px;
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .notification-header i {
      font-size: 16px;
    }

    .notification-success i {
      color: #10b981;
    }

    .notification-error i {
      color: #ef4444;
    }

    .notification-info i {
      color: #3b82f6;
    }

    .notification-warning i {
      color: #f59e0b;
    }

    .notification-header strong {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #374151;
    }

    .notification-message {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .notifications-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }

  close(id: string) {
    this.notificationService.remove(id);
  }
}
