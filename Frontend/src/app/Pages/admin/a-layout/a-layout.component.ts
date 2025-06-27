// src/app/Pages/admin/a-layout/a-layout.component.ts

// 1. Angular Core Imports
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

// 2. Third-Party Library Imports (e.g., Font Awesome)
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // CORRECTED: Import FontAwesomeModule instead of FaIconComponent
import {
  faTachometerAlt,
  faCalendarCheck,
  faUsers,
  faCreditCard,
  faBook,
  faQuestionCircle, // Included for FAQ
  faEnvelope,
  faGear,
  faBell,
  faUserCircle,
  faSignOutAlt,
  faChevronDown,
  faBars,
  faStar,
  faAngleLeft,
  faAngleRight
} from '@fortawesome/free-solid-svg-icons';

// 3. Application-Specific Component Imports
import { FooterComponent } from '../../Reusable/footer/footer.component';

// 4. Interfaces (placed before the component decorator for clarity)
interface AdminNavLink {
  label: string;
  route: string; // This is the segment relative to '/Admin/'
  icon: any;
  id: string;
  isExpanded?: boolean;
}

// **MODIFIED:** Added 'label' to TopbarAction interface
interface TopbarAction {
  id: string;
  icon: any;
  badge?: number;
  label: string; // Added this property for accessible text/tooltip
}

// 5. Component Decorator
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule, // CORRECTED: Use FontAwesomeModule here
    FooterComponent
  ],
  templateUrl: './a-layout.component.html',
  styleUrls: ['./a-layout.component.css']
})
export class ALayoutComponent implements OnInit {
  // 6. Properties (grouped by type/purpose)

  // Icons
  icons = {
    dashboard: faTachometerAlt,
    appointments: faCalendarCheck,
    users: faUsers,
    payments: faCreditCard,
    blog: faBook,
    faq: faQuestionCircle, // FAQ icon
    messages: faEnvelope, // Keep as 'messages' for the icon itself, it's just a variable name
    settings: faGear,
    notifications: faBell,
    profile: faUserCircle,
    logout: faSignOutAlt,
    chevron: faChevronDown,
    menu: faBars,
    review: faStar,
    angleLeft: faAngleLeft,
    angleRight: faAngleRight
  };

  // Navigation links
  navLinks: AdminNavLink[] = [
    {
      label: 'Dashboard',
      route: 'Home',
      icon: this.icons.dashboard,
      id: 'dashboard'
    },
    {
      label: 'Appointments',
      route: 'Appointment',
      icon: this.icons.appointments,
      id: 'appointments',
      isExpanded: false
    },
    {
      label: 'User Management',
      route: 'User',
      icon: this.icons.users,
      id: 'users',
      isExpanded: false
    },
    {
      label: 'Payments',
      route: 'Payment',
      icon: this.icons.payments,
      id: 'payments'
    },
    {
      label: 'Blog',
      route: 'Blog',
      icon: this.icons.blog,
      id: 'blog-management'
    },
    {
      label: 'FAQ',
      route: 'FAQ',
      icon: this.icons.faq,
      id: 'faq-management'
    },
    {
      // CORRECTED: Label changed to "Contact Us" for display
      label: 'Contact Us', // Display label in navigation
      route: 'ContactUs', // Route path remains 'ContactUs' (camelCase, no underscore)
      icon: this.icons.messages, // Using the envelope icon for contact messages
      id: 'contact-us-messages'
    },
    {
      label: 'Reviews',
      route: 'Review',
      icon: this.icons.review,
      id: 'reviews'
    },
    {
      label: 'Notifications',
      route: 'Notifications',
      icon: this.icons.notifications,
      id: 'notifications-main'
    },
    {
      label: 'Settings',
      route: 'Setting',
      icon: this.icons.settings,
      id: 'settings'
    }
  ];

  // **MODIFIED:** Added 'label' to topbarActions array items
  topbarActions: TopbarAction[] = [
    { id: 'notifications', icon: this.icons.notifications, badge: 3, label: 'Notifications' }
  ];

  // UI State
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isSidebarCollapsed = false;

  // 7. Constructor
  constructor(public router: Router) { }

  // 8. Lifecycle Hooks (e.g., ngOnInit)
  ngOnInit(): void {
    // Initialization logic, if any.
  }

  // 9. Methods (public methods first, then private/helper methods)

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isSidebarCollapsed = false;
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  handleTopbarAction(actionId: string): void {
    this.closeMobileMenu();
    if (actionId === 'notifications') {
      this.router.navigate(['/Admin/Notifications']).catch(error => {
        console.error('Navigation to Notifications failed:', error);
      });
    }
  }

  logout(): void {
    console.log('Attempting to log out...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/Dashboard/Home']).then(() => {
      window.location.reload(); // Reloads the page after navigation to clear Angular state
    }).catch(error => {
      console.error('Logout navigation failed:', error);
    });
  }
}