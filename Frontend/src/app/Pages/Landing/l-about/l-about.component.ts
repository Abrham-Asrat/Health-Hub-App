import { Component, ViewChild, ElementRef } from '@angular/core';



@Component({
  selector: 'app-l-about',
  imports: [],
  templateUrl: './l-about.component.html',
  styleUrl: './l-about.component.css',
})
export class LAboutComponent {

  // List of doctors
  doctors = [
    { name: 'Dr. John Smith', image: './assets/images/abdoc2.jpg' },
    { name: 'Dr. Emily White', image: './assets/images/abdoc1.jpg' },
    { name: 'Dr. Jane Doe', image: './assets/images/abdoc2.jpg' },
  ];

  // List of features
  features = [
    {
      icon: 'bi-heart-pulse-fill',
      colorClass: 'text-danger',
      title: 'Easy Access to Healthcare',
      description: 'Find and book doctors quickly.',
    },
    {
      icon: 'bi-shield-lock-fill',
      colorClass: 'text-success',
      title: 'Secure & Reliable',
      description: 'Safe payments and OTP-protected login.',
    },
    {
      icon: 'bi-gear-fill',
      colorClass: 'text-primary',
      title: 'Comprehensive Services',
      description:
        'From medical consultations to health blogs, expert advice, and more.',
    },
  ];

  // Reference to the section to scroll to
  @ViewChild('section1') section1!: ElementRef;
  
  /**
   * Scrolls to the specified section.
   */
  scrollToSection(): void {
    this.section1.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
