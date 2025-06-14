// blog.model.ts
export interface Blog {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  date?: string;
  likes: number;
  expanded: boolean;
  showComments: boolean;
  newComment: string;
  comments: Comment[];
  tags: string[];
  showMoreButton: boolean;
}

export interface Comment {
  id?: string;
  blogId: string;
  senderId: string;
  senderName: string;
  commentText: string;
}
