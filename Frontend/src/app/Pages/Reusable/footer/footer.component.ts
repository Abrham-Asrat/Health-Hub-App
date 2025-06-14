import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgFor],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  navigationLinks = [
    '🏠 Home',
    'ℹ️ About Us',
    '💡 How It Works',
    '📝 Blog',
    '📞 Contact Us',
  ];
  services = [
    '📅 Online Appointments',
    '💬 Doctor-Patient Chat',
    '📖 Health Articles',
    '💳 Secure Payments',
  ];
  legalLinks = ['General Info', 'Privacy Policy', 'Terms of Service'];
  contacts = [
    'support.com',
    '+251 2399 1145',
    'Contact Us',
    'Facebook',
    'LinkedIn',
    'Twitter',
  ];
}
