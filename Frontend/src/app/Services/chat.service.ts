import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, ChatFile, ContactMessage } from '../Pages/models/chat.model';
import { map } from 'rxjs/operators';

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
}

export interface CreateMessageDto {
  conversationId: string;
  text?: string;
  files?: File[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private http: HttpClient) {
    // Log cookies for debugging
    console.log('Current cookies:', document.cookie);
    console.log('Current token:', localStorage.getItem('token'));

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chatHub`, {
        withCredentials: true, // Enable sending cookies
        accessTokenFactory: () => {
          // Get the auth token from localStorage or wherever you store it
          const token = localStorage.getItem('token');
          console.log('Using token for SignalR:', token);
          return token || '';
        }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with max delay of 30 seconds
          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          console.log(`Reconnection attempt ${retryContext.previousRetryCount + 1}, delay: ${delay}ms`);
          return delay;
        }
      })
      .configureLogging(LogLevel.Debug) // Change to Debug for more detailed logs
      .build();

    // Handle connection errors
    this.hubConnection.onclose((error) => {
      console.error('Connection closed:', error);
      console.error('Connection state:', this.hubConnection.state);
      console.error('Connection ID:', this.hubConnection.connectionId);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting reconnection ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
        setTimeout(() => this.startConnection(), 5000);
      }
    });

    // Add connection state change logging
    this.hubConnection.onreconnecting((error) => {
      console.log('Reconnecting:', error);
      console.log('Connection state:', this.hubConnection.state);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('Reconnected:', connectionId);
      console.log('Connection state:', this.hubConnection.state);
    });
  }

  public async startConnection(): Promise<void> {
    try {
      // Log connection attempt
      console.log('Attempting to connect to SignalR hub...');
      console.log('Current connection state:', this.hubConnection.state);
      console.log('Current token:', localStorage.getItem('token'));
      console.log('API URL:', `${environment.apiUrl}/chatHub`);
      
      await this.hubConnection.start();
      console.log('Chat SignalR Connected!');
      console.log('Connection ID:', this.hubConnection.connectionId);
      console.log('Connection state:', this.hubConnection.state);
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    } catch (err) {
      console.error('Error while starting connection: ', err);
      console.error('Connection state:', this.hubConnection.state);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting reconnection ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
        setTimeout(() => this.startConnection(), 5000);
      }
    }
  }

  public addReceiveHandler(callback: (message: ChatMessage) => void): void {
    this.hubConnection.on('ReceiveMessage', (message: any) => {
      // Transform the received message to match our ChatMessage interface
      const transformedMessage: ChatMessage = {
        ...message,
        sender: message.senderId === this.getCurrentUserId() ? 'patient' : 'doctor',
        time: new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      };
      callback(transformedMessage);
    });
  }

  public async sendMessage(message: CreateMessageDto): Promise<void> {
    try {
      if (!this.hubConnection.state) {
        await this.startConnection();
      }
      await this.hubConnection.invoke('SendMessage', 
        message.conversationId,
        message.text,
        message.files
      );
    } catch (err) {
      console.error('Error sending message: ', err);
      throw err;
    }
  }

  // API Calls
  public createConversation(participants: string[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/conversations`, { participants });
  }

  public getMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/conversations/messages/${conversationId}`).pipe(
      map(messages => messages.map(message => ({
        ...message,
        sender: message.senderId === this.getCurrentUserId() ? 'patient' : 'doctor',
        time: new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      })))
    );
  }

  public getConversations(userId: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${environment.apiUrl}/api/conversations/users/${userId}`);
  }

  public getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${environment.apiUrl}/api/conversations/${conversationId}`);
  }

  public deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/conversations/message/${messageId}`);
  }

  public setMessages(messages: ChatMessage[]): void {
    this.messagesSubject.next(messages);
  }

  public addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  private getCurrentUserId(): string {
    // TODO: Get from auth service
    return 'current-user-id';
  }
}
