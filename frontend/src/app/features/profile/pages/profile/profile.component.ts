import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h2>Profile Page</h2>
      <p>Profile functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 40px 20px;
      text-align: center;
    }
  `]
})
export class ProfileComponent {}
