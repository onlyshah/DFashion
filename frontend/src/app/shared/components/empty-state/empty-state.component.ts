import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <ion-icon [name]="icon" [color]="iconColor"></ion-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <ion-button 
        *ngIf="buttonText" 
        [color]="buttonColor"
        [fill]="buttonFill"
        (click)="onButtonClick()">
        <ion-icon [name]="buttonIcon" slot="start" *ngIf="buttonIcon"></ion-icon>
        {{ buttonText }}
      </ion-button>
    </div>
  `,
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon: string = 'document-outline';
  @Input() iconColor: string = 'medium';
  @Input() title: string = 'No data found';
  @Input() message: string = 'There are no items to display at the moment.';
  @Input() buttonText: string = '';
  @Input() buttonIcon: string = '';
  @Input() buttonColor: string = 'primary';
  @Input() buttonFill: string = 'solid';

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
