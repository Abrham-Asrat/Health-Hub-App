import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  message: string;
  notificationType: string;
  userId: string;
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: HubConnection;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/notificationHub`)
      .withAutomaticReconnect()
      .build();
  }

  public async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR Connected!');
    } catch (err) {
      console.error('Error while starting connection: ', err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  public addReceiveHandler(callback: (notification: Notification) => void): void {
    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      callback(notification);
    });
  }

  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('MarkNotificationAsRead', notificationId);
    } catch (err) {
      console.error('Error marking notification as read: ', err);
    }
  }

  public getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  public addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  public removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(n => n.id !== notificationId)
    );
  }
}
