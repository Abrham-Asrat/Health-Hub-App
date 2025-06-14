import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewChecked,
  OnInit,
  OnDestroy
} from '@angular/core';
import { ChatMessage, ContactMessage } from '../../models/chat.model';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { RatingComponent } from '../rating/rating.component';
import { ChatService, CreateMessageDto } from '../../../Services/chat.service';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgClass, NgStyle, NgIf, NgFor, RatingComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewChecked, OnInit, OnDestroy {
  // User Info
  @Input() userRole: 'doctor' | 'patient' = 'patient';
  @Input() userName: string = '';
  @Input() userImage: string = '';
  @Input() conversationId: string = '';
  @Input() isLoading: boolean = false;

  // Peer Info
  @Input() peerName: string = '';
  @Input() peerImage: string = '';

  // Contacts & Messages
  @Input() contacts: ContactMessage[] = [];
  @Input() messages: ChatMessage[] = [];

  // Outputs
  @Output() contactSelected = new EventEmitter<ContactMessage>();

  // Local state
  newMessage = '';
  isRecording = false;
  private timerInterval: any;
  recordingTime = '00:00';
  private startTime: number | null = null;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: BlobPart[] = [];
  private subscription: Subscription;

  constructor(private chatService: ChatService) {
    this.subscription = this.chatService.messages$.subscribe(
      messages => this.messages = messages
    );
  }

  ngOnInit(): void {
    this.chatService.startConnection();
    this.chatService.addReceiveHandler((message) => {
      this.chatService.addMessage(message);
    });

    if (this.conversationId) {
      this.loadMessages();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private loadMessages(): void {
    this.chatService.getMessages(this.conversationId).subscribe({
      next: (messages) => {
        this.chatService.setMessages(messages);
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
      }
    });
  }

  // Send Text Message
  sendMessage(): void {
    if (this.newMessage.trim() && this.conversationId) {
      const messageDto: CreateMessageDto = {
        conversationId: this.conversationId,
        text: this.newMessage
      };

      this.chatService.sendMessage(messageDto).catch(err => {
        console.error('Failed to send message:', err);
      });

      this.newMessage = '';
    }
  }

  // Send Image
  sendImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('image/') && this.conversationId) {
      const messageDto: CreateMessageDto = {
        conversationId: this.conversationId,
        files: [file]
      };

      this.chatService.sendMessage(messageDto).catch(err => {
        console.error('Failed to send image:', err);
      });
    }
  }

  startRecording(): void {
    if (this.isRecording) return;

    this.recordingTime = '00:00';
    this.startTime = Date.now();

    this.timerInterval = setInterval(() => {
      if (this.isRecording && this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime!) / 1000);
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        this.recordingTime = `${minutes}:${seconds}`;
      }
    }, 1000);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.isRecording = true;
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          if (blob.size === 0) {
            console.warn('Empty audio blob. Recording may have failed.');
            return;
          }

          if (this.conversationId) {
            const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
            const messageDto: CreateMessageDto = {
              conversationId: this.conversationId,
              files: [file]
            };

            this.chatService.sendMessage(messageDto).catch(err => {
              console.error('Failed to send audio:', err);
            });
          }

          stream.getTracks().forEach((track) => track.stop());
          this.mediaRecorder = null;
        };
        this.mediaRecorder.start(100);
      })
      .catch((err) => {
        console.error('Microphone access denied', err);
        alert('Could not access microphone. Please allow permissions.');
        this.isRecording = false;
      });
  }

  // Stop Audio Recording
  stopRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.isRecording = false;

    try {
      this.mediaRecorder.requestData();
      this.mediaRecorder.stop();
    } catch (error) {
      console.error('Error stopping:', error);
    }
  }

  selectContact(contact: ContactMessage): void {
    this.contactSelected.emit(contact);
  }

  // Scroll to bottom of chat box
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const container = document.querySelector('.chat-box');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll failed:', err);
    }
  }

  // Open Review Modal (only for patient)
  openReviewModal(): void {
    const modalElement = document.getElementById('ratingModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'image' : 'audio';

    // Create message object
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: this.userRole,
      type: fileType,
      text: '',
      time: new Date().toLocaleTimeString(),
      files: [{
        id: Date.now().toString(),
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type
      }],
      conversationId: this.conversationId,
      senderId: this.userRole === 'doctor' ? 'doctor' : 'patient',
      createdAt: new Date()
    };

    // Add message to chat
    this.messages.push(message);

    // Upload file to server
    this.chatService.sendMessage({
      conversationId: this.conversationId,
      files: [file]
    }).then(() => {
      // The message is already in the chat, no need to update
      console.log('File uploaded successfully');
    }).catch((error: Error) => {
      console.error('Error uploading file:', error);
      // Remove message if upload failed
      this.messages = this.messages.filter(m => m.id !== message.id);
    });

    // Clear file input
    input.value = '';
  }
}