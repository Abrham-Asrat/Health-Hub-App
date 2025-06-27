// src/app/Pages/admin/a-notification/a-notification.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import {
  faBell,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faUserShield,
  faCreditCard,
  faCalendarCheck,
  faCommentDots,
  faEnvelope,
  faSpinner,
  faTrash,
  faEye,
  faCircleDot,
  faUserCog,
  faExclamationTriangle,
  faQuestionCircle,
  faComments,
  faCommentAlt,
  faSearch,
  faDownload,
  faUndo
} from '@fortawesome/free-solid-svg-icons';

interface AdminNotification {
  id: string;
  type: 'user' | 'payment' | 'appointment' | 'content' | 'system' | 'security' | 'inquiry' | 'report' | 'feedback' | 'chat-log';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  link?: string | null;
  metadata?: {
    userId?: string;
    amount?: number;
    appointmentId?: string;
    contentId?: string;
    ipAddress?: string;
    issueCategory?: string;
    reportedContentType?: string;
    reportedContentId?: string;
  };
  senderId?: string;
}

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    FormsModule,
    DatePipe,
    NgIf,
    NgFor,
    NgClass
  ],
  templateUrl: './a-notification.component.html',
  styleUrls: ['./a-notification.component.css']
})
export class ANotificationComponent implements OnInit {
  notifications: AdminNotification[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  unreadCount = 0;
  filter: 'unread' | 'all' | 'inquiry' | 'report' | 'feedback' | 'chat-log' = 'all';

  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  confirmationNotificationId: string | null = null;
  confirmationActionType: 'delete' | 'clearAll' | 'markAllRead' | '' = '';
  isSubmitting: boolean = false;

  icons = {
    bell: faBell,
    checkCircle: faCheckCircle,
    timesCircle: faTimesCircle,
    infoCircle: faInfoCircle,
    user: faUserShield,
    payment: faCreditCard,
    appointment: faCalendarCheck,
    comment: faCommentDots,
    chat: faEnvelope,
    spinner: faSpinner,
    trash: faTrash,
    view: faEye,
    dot: faCircleDot,
    admin: faUserCog,
    exclamationTriangle: faExclamationTriangle,
    questionCircle: faQuestionCircle,
    comments: faComments,
    commentAlt: faCommentAlt,
    search: faSearch,
    download: faDownload,
    undo: faUndo
  };

  constructor() { }

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.isLoading = true;
    this.errorMessage = null;

    setTimeout(() => {
      this.notifications = [
        {
          id: '1',
          type: 'user',
          title: 'New Doctor Registration',
          message: 'Dr. Sarah Johnson has registered and needs verification.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false,
          priority: 'high',
          link: '/Admin/User/all',
          metadata: { userId: 'doc_789xyz' },
          senderId: 'system'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Processed',
          message: 'New payment of ETB 1500.00 completed by patient Michael Brown.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false,
          priority: 'medium',
          link: '/Admin/Payment',
          metadata: { amount: 1500, userId: 'pat_123abc' },
          senderId: 'system'
        },
        {
          id: '3',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled database maintenance tonight at 2:00 AM. Expected downtime: 1 hour.',
          timestamp: new Date(Date.now() - 24 * 60 * 1000 * 60),
          isRead: true,
          priority: 'medium',
          link: null,
          senderId: 'system'
        },
        {
          id: '4',
          type: 'security',
          title: 'Suspicious Login Attempt',
          message: 'Multiple failed login attempts detected for admin account from IP 192.168.1.45.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 1000 * 60),
          isRead: false,
          priority: 'high',
          link: '/Admin/Settings',
          metadata: { ipAddress: '192.168.1.45' },
          senderId: 'system'
        },
        {
          id: '5',
          type: 'content',
          title: 'New Blog Post Reported',
          message: 'A patient reported inappropriate content in "Understanding Diabetes". Please review.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 1000 * 60),
          isRead: true,
          priority: 'medium',
          link: '/Admin/Blog',
          metadata: { contentId: 'blog_456def' },
          senderId: 'patient_reporter'
        },
        {
          id: '6',
          type: 'appointment',
          title: 'Appointment Cancellation',
          message: 'Dr. Alemayehu Gebre has canceled appointment #APPT2025-001 with patient Abebe Kebede.',
          timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 1000 * 60),
          isRead: false,
          priority: 'medium',
          link: '/Admin/Appointment',
          metadata: { appointmentId: 'APPT2025-001' },
          senderId: 'Dr. Alemayehu'
        },
        {
          id: '7',
          type: 'user',
          title: 'User Profile Updated',
          message: 'Patient Genet Tesfaye updated her contact information.',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 1000 * 60),
          isRead: true,
          priority: 'low',
          link: '/Admin/User',
          metadata: { userId: 'pat_456def' },
          senderId: 'system'
        },
        {
          id: '8',
          type: 'inquiry',
          title: 'Patient Inquiry Received',
          message: 'Patient John Doe submitted an inquiry about medication side effects.',
          timestamp: new Date(Date.now() - 1 * 60 * 1000),
          isRead: false,
          priority: 'high',
          link: '/Admin/ContactUs',
          metadata: { issueCategory: 'Medication' },
          senderId: 'John Doe'
        },
        {
          id: '9',
          type: 'report',
          title: 'Fraudulent Activity Report',
          message: 'User reported suspicious activity related to a payment transaction.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          isRead: false,
          priority: 'high',
          link: '/Admin/Reports',
          metadata: { reportedContentType: 'Payment', reportedContentId: 'TXN789012' },
          senderId: 'Jane Smith'
        },
        {
          id: '10',
          type: 'feedback',
          title: 'Website Feedback Submitted',
          message: 'Patient provided feedback on the new appointment booking system. Rating: 5/5.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
          priority: 'medium',
          link: '/Admin/Feedback',
          metadata: { issueCategory: 'Website Experience' },
          senderId: 'Anonymous'
        },
        {
          id: '11',
          type: 'chat-log',
          title: 'New Support Chat Log',
          message: 'A chat session regarding account recovery has been completed. Review log.',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          isRead: true,
          priority: 'low',
          link: '/Admin/ChatLogs',
          metadata: { contentId: 'CHATLOG-001' },
          senderId: 'Support Agent 1'
        }
      ];

      this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.updateUnreadCount();
      this.isLoading = false;
    }, 1000);
  }

  get filteredNotifications(): AdminNotification[] {
    let tempNotifications = this.notifications;

    if (this.filter === 'unread') {
      tempNotifications = tempNotifications.filter(n => !n.isRead);
    } else if (this.filter !== 'all') {
      tempNotifications = tempNotifications.filter(n => n.type === this.filter);
    }
    return tempNotifications;
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.updateUnreadCount();
      console.log(`Notification ${id} marked as read.`);
    }
  }

  promptMarkAllAsRead(): void {
    if (this.unreadCount === 0) return;
    this.showConfirmation(
      'markAllRead',
      null,
      'Are you sure you want to mark all notifications as read?'
    );
  }

  promptDeleteNotification(id: string): void {
    this.showConfirmation(
      'delete',
      id,
      'Are you sure you want to delete this notification? This action cannot be undone.'
    );
  }

  promptClearAllNotifications(): void {
    if (this.notifications.length === 0) return;
    this.showConfirmation(
      'clearAll',
      null,
      'Are you sure you want to clear all notifications? This action cannot be undone.'
    );
  }

  showConfirmation(action: 'delete' | 'clearAll' | 'markAllRead', notificationId: string | null, message: string): void {
    this.confirmationActionType = action;
    this.confirmationNotificationId = notificationId;
    this.confirmationMessage = message;
    this.showConfirmationModal = true;
  }

  hideConfirmation(): void {
    this.showConfirmationModal = false;
    this.confirmationActionType = '';
    this.confirmationNotificationId = null;
    this.confirmationMessage = '';
    this.isSubmitting = false;
  }

  performConfirmedAction(): void {
    this.isSubmitting = true;

    setTimeout(() => {
      if (this.confirmationActionType === 'delete' && this.confirmationNotificationId) {
        this.notifications = this.notifications.filter(n => n.id !== this.confirmationNotificationId);
        console.log(`Notification ${this.confirmationNotificationId} deleted.`);
      } else if (this.confirmationActionType === 'markAllRead') {
        this.notifications.forEach(n => n.isRead = true);
        console.log('All notifications marked as read.');
      } else if (this.confirmationActionType === 'clearAll') {
        this.notifications = [];
        console.log('All notifications cleared.');
      }

      this.updateUnreadCount();
      this.hideConfirmation();
    }, 500);
  }

  getNotificationIcon(type: string): IconDefinition {
    switch (type) {
      case 'user': return this.icons.user;
      case 'payment': return this.icons.payment;
      case 'appointment': return this.icons.appointment;
      case 'content': return this.icons.comment;
      case 'security': return this.icons.admin;
      case 'system': return this.icons.infoCircle;
      case 'inquiry': return this.icons.questionCircle;
      case 'report': return this.icons.exclamationTriangle;
      case 'feedback': return this.icons.comments;
      case 'chat-log': return this.icons.chat;
      default: return this.icons.infoCircle;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-500';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  shortenId(id: string | undefined, length: number = 6): string {
    if (!id) return '';
    if (id.length <= length) return id;
    return `${id.substring(0, length)}...`;
  }

  // >>> THIS IS THE METHOD THAT WAS MISSING OR MISSPELLED <<<
  getConfirmationButtonLabel(): string {
    switch (this.confirmationActionType) {
      case 'delete': return 'Delete';
      case 'clearAll': return 'Clear All';
      case 'markAllRead': return 'Mark All As Read';
      default: return 'Confirm Action';
    }
  }
}