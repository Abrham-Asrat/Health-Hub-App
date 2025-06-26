import { NgClass, UpperCasePipe } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { SignUpComponent } from '../../Landing/sign-up/sign-up.component';
import { LoginComponent } from '../../Landing/log-in/log-in.component';
import { OTPComponent } from '../../Landing/otp/otp.component';
import { ActiveTabService } from '../../shared/active-tab.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    NgClass,
    RouterLink,
    RouterOutlet,
    UpperCasePipe,
    SignUpComponent,
    LoginComponent,
    OTPComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  @Input() navLinks: string[] = [];
  @Input() message: string = '';
  @Input() Notification: string = '';
  @Input() profile: string = '';
  @Input() showProfile: boolean = false;

  @Output() tabChange = new EventEmitter<string>();
  activeTab = 'Home';
  isScrolled = false; // For scroll effect on header

  private isManualTabSet = false; // Prevents overwriting after manual click

  constructor(
    private router: Router,
    private activeTabService: ActiveTabService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Route-based updates
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        if (!this.isManualTabSet) {
          this.updateActiveTabBasedOnRoute(
            event.urlAfterRedirects || event.url
          );
        }
        this.isManualTabSet = false;
      });

    // Service-based updates (from child components)
    this.activeTabService.currentTab$.subscribe((tab) => {
      if (tab) {
        this.activeTab = tab;
        this.isManualTabSet = true;
      }
    });

    // Set initial active tab based on current route
    this.updateActiveTabBasedOnRoute(this.router.url);
  }

  setActive(link: string) {
    this.activeTab = link;
    this.isManualTabSet = true;
    this.tabChange.emit(link);
    this.activeTabService.setActiveTab(link);
  }
  private updateActiveTabBasedOnRoute(url: string): void {
    const urlSegments = url.split('/').filter(Boolean); // Remove empty segments
    let matchedLink: string | undefined;

    // Try matching from last segment upward (e.g., match 'Appointment' in '/Doctor/Appointment')
    for (let i = urlSegments.length - 1; i >= 0; i--) {
      const segment = urlSegments[i];
      matchedLink = this.navLinks.find(
        (link) => link.toLowerCase() === segment.toLowerCase()
      );
      if (matchedLink) break;
    }

    // Match special routes
    if (url.startsWith(this.Notification)) {
      this.activeTab = 'notification';
    } else if (url.startsWith(this.message)) {
      this.activeTab = 'chat';
    } else if (url.startsWith(this.profile)) {
      this.activeTab = 'profile';
    } else if (matchedLink) {
      this.activeTab = matchedLink;
    } else {
      this.activeTab = '';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;

    this.isScrolled = scrollPosition > scrollHeight * 0.03;
  }

  logOut() {
    console.log('Layout logOut method called');
    
    try {
      // Check if we're in a browser environment
      
      if (typeof window === 'undefined') {
        console.error('Window object not available');
        return;
      }

      console.log('About to show confirmation dialog');
      
      // Use a more reliable confirmation method
      const userConfirmed = confirm('Are you sure you want to log out?');
      
      console.log('Confirmation result:', userConfirmed);
      
      if (userConfirmed) {
        console.log('User confirmed logout, calling AuthService.logout()');
        
        // Use the AuthService logout method which handles everything properly
        this.authService.logout();
        
      } else {
        console.log('Logout canceled by user.');
      }
    } catch (error) {
      console.error('Error in logout process:', error);
      // Emergency logout - use AuthService
      this.authService.logout();
    }
  }
}
