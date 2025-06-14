import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LayoutComponent } from '../../Reusable/layout/layout.component';
import { FooterComponent } from "../../Reusable/footer/footer.component";

@Component({
  selector: 'app-d-layout',
  imports: [LayoutComponent, FooterComponent],
  templateUrl: './d-layout.component.html',
  styleUrl: './d-layout.component.css',
})
export class DLayoutComponent {
  Links: string[] = ['Home', 'Appointment', 'Blog', 'Contact'];
  Chat: string = 'Chat';
  Notification: string = 'Notification';
  profile: string = 'Profile';
  activeTab = 'Home';
  setActive(link: string) {
    this.activeTab = link;
  }
}
