import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FooterComponent } from '../../Reusable/footer/footer.component';
import { LayoutComponent } from '../../Reusable/layout/layout.component';
@Component({
  selector: 'app-a-layout',
  standalone: true,
  imports: [LayoutComponent, FooterComponent],
  templateUrl: './a-layout.component.html',
  styleUrls: ['./a-layout.component.css'],
})
export class ALayoutComponent {
  Links: string[] = ['Home', 'Appointment', 'User', 'Payment', 'Blog', 'Setting'];
  Chat: string = 'AChat';
  Notification: string = 'ANotification';
  profile: string = 'AProfile';

  activeTab = 'AHome';

  setActive(link: string) {
    this.activeTab = link;
  }
}
