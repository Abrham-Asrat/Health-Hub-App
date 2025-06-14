export interface BlogDto {
  blogId: string;
  authorId: string;
  title: string;
  content: string;
  slug: string;
  summary: string;
  tags: string[];
  author: any; // Replace with actual author type
  blogLikes: any[]; // Replace with actual blog likes type
  showComments?: boolean;
  newComment?: string;
  expanded?: boolean;
  showMoreButton?: boolean;
  comments?: BlogCommentDto[];
  likes?: number;
  category?: string;
}

export interface CreateBlogDto {
  authorId: string;
  title: string;
  content: string;
  slug: string;
  summary: string;
  tags: string[];
}

export interface EditBlogDto {
  title: string;
  content: string;
  slug: string;
  summary: string;
  tags: string[];
}

export interface BlogCommentDto {
  commentId: string;
  blogId: string;
  userId: string;
  text: string;
  author: string;
  date: string;
}

export interface CreateBlogCommentDto {
  blogId: string;
  userId: string;
  text: string;
}

export interface CreateBlogLikeDto {
  blogId: string;
  userId: string;
}

export interface BlogLikeDto {
  isLiked: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
} 