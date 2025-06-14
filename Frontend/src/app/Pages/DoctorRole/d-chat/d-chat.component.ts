import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChatComponent } from '../../Reusable/chat/chat.component';
import { ChatMessage, ContactMessage } from '../../models/chat.model';
import { ChatService } from '../../../Services/chat.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-d-chat',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './d-chat.component.html',
  styleUrls: ['./d-chat.component.css'],
})
export class DChatComponent implements AfterViewInit, OnInit {
  peerName = '';
  peerImage = '';
  chatMessages: ChatMessage[] = [];
  contactsList: ContactMessage[] = [];
  currentConversationId: string = '';
  isLoading = true;

  constructor(
    private chatService: ChatService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  ngAfterViewInit(): void {
    // Wait for contacts to load before selecting first contact
    if (this.contactsList.length > 0) {
      this.onContactSelected(this.contactsList[0]);
    }
  }

  private loadConversations(): void {
    const doctorId = this.authService.getCurrentUserId();
    this.chatService.getConversations(doctorId).subscribe({
      next: (conversations) => {
        this.contactsList = conversations.map(conv => ({
          id: conv.id,
          name: this.getPeerName(conv),
          image: this.getPeerImage(conv),
          lastMessage: conv.lastMessage?.text,
          lastMessageTime: conv.lastMessage?.time,
          unreadCount: 0 // TODO: Implement unread count
        }));
        this.isLoading = false;

        // Select first contact if available
        if (this.contactsList.length > 0) {
          this.onContactSelected(this.contactsList[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
        this.isLoading = false;
      }
    });
  }

  onContactSelected(contact: ContactMessage) {
    this.peerName = contact.name;
    this.peerImage = contact.image;
    this.currentConversationId = contact.id;

    // Load messages for the selected conversation
    this.chatService.getMessages(contact.id).subscribe({
      next: (messages) => {
        this.chatMessages = messages;
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
      }
    });
  }

  private getPeerName(conversation: any): string {
    // Get the other participant's name (not the current doctor)
    const doctorId = this.authService.getCurrentUserId();
    const peer = conversation.participants.find((p: any) => p.id !== doctorId);
    return peer?.fullName || 'Unknown Patient';
  }

  private getPeerImage(conversation: any): string {
    // Get the other participant's image (not the current doctor)
    const doctorId = this.authService.getCurrentUserId();
    const peer = conversation.participants.find((p: any) => p.id !== doctorId);
    return peer?.profileImage || 'assets/images/default-avatar.png';
  }
}
