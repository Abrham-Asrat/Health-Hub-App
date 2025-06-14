import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from '../../../Services/notification.service';
import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DatePipe],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {
    this.subscription = this.notificationService.notifications$.subscribe(
      (notifications: Notification[]) => this.notifications = notifications
    );
  }

  ngOnInit(): void {
    this.notificationService.startConnection();
    this.notificationService.addReceiveHandler((notification) => {
      this.notificationService.addNotification(notification);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    this.notificationService.removeNotification(notification.id);
  }

  remove(id: string): void {
    this.notificationService.removeNotification(id);
  }
}
