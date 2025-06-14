export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: 'doctor' | 'patient';
  text?: string;
  files?: ChatFile[];
  fileUrl?: string;
  createdAt: Date;
  time: string;
  type: 'text' | 'image' | 'audio';
}

export interface ChatFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  image: string;
  specialty?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}
