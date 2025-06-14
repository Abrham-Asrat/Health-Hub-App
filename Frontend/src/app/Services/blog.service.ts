import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  BlogDto, 
  CreateBlogDto, 
  EditBlogDto, 
  BlogCommentDto, 
  CreateBlogCommentDto, 
  CreateBlogLikeDto,
  BlogLikeDto,
  ApiResponse 
} from '../Models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'api/blogs';

  constructor(private http: HttpClient) {}

  getAllBlogs(): Observable<ApiResponse<BlogDto[]>> {
    return this.http.get<ApiResponse<BlogDto[]>>(`${this.apiUrl}/all`);
  }

  getBlogById(blogId: string): Observable<ApiResponse<BlogDto>> {
    return this.http.get<ApiResponse<BlogDto>>(`${this.apiUrl}/${blogId}`);
  }

  createBlog(blog: CreateBlogDto): Observable<ApiResponse<BlogDto>> {
    return this.http.post<ApiResponse<BlogDto>>(this.apiUrl, blog);
  }

  updateBlog(blogId: string, blog: EditBlogDto): Observable<ApiResponse<BlogDto>> {
    return this.http.put<ApiResponse<BlogDto>>(`${this.apiUrl}/${blogId}`, blog);
  }

  deleteBlog(blogId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}`);
  }

  postComment(comment: CreateBlogCommentDto): Observable<ApiResponse<BlogCommentDto>> {
    return this.http.post<ApiResponse<BlogCommentDto>>(`${this.apiUrl}/comment`, comment);
  }

  getBlogComments(blogId: string): Observable<ApiResponse<BlogCommentDto[]>> {
    return this.http.get<ApiResponse<BlogCommentDto[]>>(`${this.apiUrl}/${blogId}/comments`);
  }

  likeBlog(like: CreateBlogLikeDto): Observable<ApiResponse<BlogLikeDto>> {
    return this.http.post<ApiResponse<BlogLikeDto>>(`${this.apiUrl}/like`, like);
  }
}
