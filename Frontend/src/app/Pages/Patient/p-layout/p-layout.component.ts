import { Component } from '@angular/core';
import { LayoutComponent } from '../../Reusable/layout/layout.component';
import { FooterComponent } from "../../Reusable/footer/footer.component";

@Component({
  selector: 'app-p-layout',
  imports: [LayoutComponent, FooterComponent],
  templateUrl: './p-layout.component.html',
  styleUrl: './p-layout.component.css',
})
export class PLayoutComponent {
  Links: string[] = ['Home', 'Appointment', 'Blog', 'Contact'];
  Chat: string = 'Chat';
  Notification: string = 'Notification';
  profile: string = 'Profile';
  activeTab = 'Home';
  setActive(link: string) {
    this.activeTab = link;
  }
}
