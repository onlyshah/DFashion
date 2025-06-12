import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="spinner-wrapper">
        <ion-spinner [name]="spinnerType" [color]="color"></ion-spinner>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() spinnerType: string = 'crescent';
  @Input() color: string = 'primary';
  @Input() overlay: boolean = false;
}
