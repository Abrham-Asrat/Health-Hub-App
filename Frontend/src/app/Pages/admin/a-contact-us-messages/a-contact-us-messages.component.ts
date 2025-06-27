// src/app/Pages/admin/a-contact-us-messages/a-contact-us-messages.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// CORRECTED: Import FontAwesomeModule instead of FaIconComponent
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// Ensure Router and RouterModule are imported here for programmatic navigation
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Needed for potential modal input (e.g., rejection reason, if added)

// IMPORTANT: Ensure you have Font Awesome installed:
// npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/angular-fontawesome

// Font Awesome icons for messages and actions
import {
  faEnvelope,
  faCommentDots,
  faBug,
  faExclamationTriangle,
  faUser,
  faFlask,
  faSpinner,
  faCheckCircle,
  faTrash,
  faEye,
  faReply,
  faFlag,
  faCircleDot
} from '@fortawesome/free-solid-svg-icons';

// Interface for Admin Message data structure (This is your model, crucial for type safety)
export interface AdminMessage {
  id: string;
  type: 'inquiry' | 'report' | 'feedback' | 'chat-log';
  senderId?: string;
  senderName: string;
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  link?: string | null; // A link to related content (e.g., chat log, reported blog post)
  metadata?: {
    reportedContentId?: string;
    reportedContentType?: string;
    chatPartnerId?: string;
    issueCategory?: string;
  };
}

@Component({
  selector: 'app-a-contact-us', // Corrected selector name
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule, // CORRECTED: Use FontAwesomeModule here
    RouterModule, // Needed for [routerLink] directive (though we'll use Router service for 'view' action)
    FormsModule // Needed for confirmation modal logic
  ],
  templateUrl: './a-contact-us-messages.component.html', // Corrected template URL
  styleUrls: ['./a-contact-us-messages.component.css'] // Assuming CSS file name also consistent
})
export class AContactUsComponent implements OnInit { // Corrected class name

  messages: AdminMessage[] = [];
  isLoading: boolean = true;
  unreadCount: number = 0;
  errorMessage: string | null = null;

  filter: 'all' | 'unread' | 'inquiry' | 'report' | 'feedback' | 'chat-log' = 'all';

  // State for custom confirmation modal
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  confirmationMessageId: string | null = null;
  confirmationActionType: 'delete' | 'clearAll' | '' = ''; // To distinguish actions
  isSubmitting: boolean = false; // For spinner on confirmation button


  icons = {
    envelope: faEnvelope,
    commentDots: faCommentDots,
    bug: faBug,
    exclamationTriangle: faExclamationTriangle,
    user: faUser,
    flask: faFlask,
    spinner: faSpinner,
    checkCircle: faCheckCircle,
    trash: faTrash,
    view: faEye,
    reply: faReply,
    flag: faFlag,
    dot: faCircleDot
  };

  // Inject Router service
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.fetchMessages();
  }

  fetchMessages(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // --- START: Mock Data Simulation ---
    setTimeout(() => {
      this.messages = [
        {
          id: 'msg1',
          type: 'inquiry',
          senderName: 'Patient Abebe',
          senderId: 'pat_123',
          subject: 'Appointment Booking Issue',
          content: 'I am unable to book an appointment with Dr. Tigist for next Tuesday. The system shows no availability.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          isRead: false,
          priority: 'high',
          metadata: { issueCategory: 'Technical' }
        },
        {
          id: 'msg2',
          type: 'report',
          senderName: 'Dr. Chaltu',
          senderId: 'doc_456',
          subject: 'Reported Inappropriate Chat Message',
          content: 'Patient John Doe sent a highly offensive message in our private chat. Please investigate.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false,
          priority: 'high',
          // Example: Link to User management or a dedicated Chat Logs page if implemented
          link: '/Admin/User', // Adjusted to a valid admin route for now
          metadata: { reportedContentId: 'chat_xyz', reportedContentType: 'chat' }
        },
        {
          id: 'msg3',
          type: 'feedback',
          senderName: 'Anonymous User',
          subject: 'Suggestion for New Feature',
          content: 'It would be great to have video consultation options directly within the platform.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isRead: false,
          priority: 'low'
        },
        {
          id: 'msg4',
          type: 'report',
          senderName: 'Patient Helen',
          senderId: 'pat_789',
          subject: 'Blog Post Quality Concern',
          content: 'The recent blog post titled "Home Remedies for Flu" contains misleading information. Can it be reviewed?',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRead: true,
          priority: 'medium',
          // Adjusted link to your Admin Blog management route
          link: '/Admin/Blog',
          metadata: { reportedContentId: 'blog_123', reportedContentType: 'blog' }
        },
        {
          id: 'msg5',
          type: 'inquiry',
          senderName: 'Dr. Kebede',
          senderId: 'doc_101',
          subject: 'Problem with Profile Update',
          content: 'I tried to update my specialty but the changes are not saving. Could you check my account?',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isRead: true,
          priority: 'medium',
          // Example: Link to Admin User management to find the doctor's profile
          link: '/Admin/User',
        }
      ];
      this.updateUnreadCount();
      this.isLoading = false;
    }, 1000);
    // --- END: Mock Data Simulation ---
  }

  get filteredMessages(): AdminMessage[] {
    let filtered = this.messages;

    if (this.filter === 'unread') {
      filtered = filtered.filter(msg => !msg.isRead);
    } else if (this.filter !== 'all') {
      filtered = filtered.filter(msg => msg.type === this.filter);
    }
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  updateUnreadCount(): void {
    this.unreadCount = this.messages.filter(msg => !msg.isRead).length;
  }

  markAsRead(id: string): void {
    const message = this.messages.find(msg => msg.id === id);
    if (message && !message.isRead) {
      message.isRead = true;
      this.updateUnreadCount();
      console.log(`Message ${id} marked as read.`);
      // In a real app, you'd send this update to a backend API
    }
  }

  markAllAsRead(): void {
    // Show confirmation modal instead of direct confirm()
    this.showConfirmation('clearAll', null, 'Are you sure you want to mark all messages as read?');
  }

  deleteMessage(id: string): void {
    // Show confirmation modal instead of direct confirm()
    this.showConfirmation('delete', id, 'Are you sure you want to delete this message? This action cannot be undone.');
  }

  clearAllMessages(): void {
    // Show confirmation modal instead of direct confirm()
    this.showConfirmation('clearAll', null, 'Are you sure you want to clear all messages? This action cannot be undone.');
  }

  /**
   * Displays the custom confirmation modal.
   * @param action The type of action ('delete' or 'clearAll').
   * @param messageId The ID of the message to act on (null for 'clearAll').
   * @param message The confirmation message to display.
   */
  showConfirmation(action: 'delete' | 'clearAll', messageId: string | null, message: string): void {
    this.confirmationActionType = action;
    this.confirmationMessageId = messageId;
    this.confirmationMessage = message;
    this.showConfirmationModal = true;
  }

  /**
   * Hides the custom confirmation modal and resets its state.
   */
  hideConfirmation(): void {
    this.showConfirmationModal = false;
    this.confirmationActionType = '';
    this.confirmationMessageId = null;
    this.confirmationMessage = '';
    this.isSubmitting = false; // Reset spinner
  }

  /**
   * Performs the confirmed action (delete single message or clear all).
   */
  performConfirmedAction(): void {
    this.isSubmitting = true; // Show spinner

    setTimeout(() => { // Simulate API call for the action
      if (this.confirmationActionType === 'delete' && this.confirmationMessageId) {
        this.messages = this.messages.filter(msg => msg.id !== this.confirmationMessageId);
        console.log(`Message ${this.confirmationMessageId} deleted.`);
      } else if (this.confirmationActionType === 'clearAll') {
        this.messages.forEach(msg => msg.isRead = true); // Mark all as read if 'clearAll' is used to confirm mark all as read.
                                                         // If 'clearAll' means delete all, uncomment the line below.
        // this.messages = []; // If clearAll means delete all messages
        console.log('All messages processed based on action.');
      }
      this.updateUnreadCount(); // Update counts after action
      this.hideConfirmation(); // Hide modal
      // In a real app, you'd send this update to a backend API
    }, 500); // Simulate network delay
  }

  getIconForMessageType(type: AdminMessage['type']): any {
    switch (type) {
      case 'inquiry': return this.icons.envelope;
      case 'report': return this.icons.flag;
      case 'feedback': return this.icons.commentDots;
      case 'chat-log': return this.icons.commentDots;
      default: return this.icons.envelope;
    }
  }

  getPriorityColorClass(priority: AdminMessage['priority']): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  shortenId(id: string | undefined, length: number = 6): string {
    if (!id) return '';
    if (id.length <= length) return id;
    return `${id.substring(0, length)}...`;
  }

  /**
   * Navigates to the link specified in the message.
   * If the link is not present or invalid, it logs an error.
   * @param message The AdminMessage object containing the link.
   */
  viewRelatedContent(message: AdminMessage): void {
    if (message.link) {
      // Use navigateByUrl for full URL strings like '/Admin/Blog'
      this.router.navigateByUrl(message.link)
        .then(() => {
          console.log(`Navigated to: ${message.link}`);
          // Optionally mark message as read after viewing related content
          this.markAsRead(message.id);
        })
        .catch(error => {
          console.error(`Failed to navigate to ${message.link}:`, error);
          this.errorMessage = `Could not navigate to related content. Invalid link: ${message.link}`;
        });
    } else {
      console.warn('No link provided for this message to view related content.');
      this.errorMessage = 'No specific link available for this message.';
    }
  }
}