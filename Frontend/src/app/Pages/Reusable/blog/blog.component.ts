import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
  OnInit,
  AfterViewChecked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../../../Services/blog.service';
import { BlogDto, CreateBlogDto, EditBlogDto, BlogCommentDto, CreateBlogCommentDto, CreateBlogLikeDto, ApiResponse } from '../../../Models/blog.model';
import { AuthService } from '../../../Services/auth.service';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-blog',
  imports: [NgFor, NgIf, FormsModule, NgClass],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements AfterViewInit, OnInit, AfterViewChecked {
  @Input() btnFromDoctor: boolean = false;
  @ViewChildren('blogContent') blogContentElements!: QueryList<ElementRef>;

  isEditing: boolean = false;
  editingBlog: BlogDto | null = null;
  isBlogForm: boolean = true;
  currentDoctorName: string = 'Dr. Workaba';
  newTag: string = '';
  isLoading: boolean = false;

  newBlog: CreateBlogDto = {
    authorId: '',
    title: '',
    content: '',
    slug: '',
    summary: '',
    tags: []
  };

  blogs: BlogDto[] = [];
  filteredBlogs: BlogDto[] = [];

  constructor(
    private blogService: BlogService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.newBlog.authorId = currentUser?.id || '';
  }

  ngOnInit() {
    this.loadBlogs();
    this.initializeDropdowns();
  }

  ngAfterViewInit() {
    this.updateBlogContentHeights();
  }

  private updateBlogContentHeights() {
    setTimeout(() => {
      this.blogContentElements.forEach((el, index) => {
        const contentElement = el.nativeElement;
        if (this.blogs[index]) {
          const isOverflowing = contentElement.scrollHeight > contentElement.clientHeight;
          this.blogs[index].showMoreButton = isOverflowing;
          this.blogs[index].expanded = !isOverflowing;
        }
      });
    }, 0);
  }

  async loadBlogs() {
    this.isLoading = true;
    try {
      const response = await this.blogService.getAllBlogs().toPromise();
      if (response?.data) {
        this.blogs = response.data.map(blog => ({
          ...blog,
          showComments: false,
          newComment: '',
          expanded: false,
          showMoreButton: false
        }));
        this.filteredBlogs = [...this.blogs];
        this.updateBlogContentHeights();
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  ngAfterViewChecked() {
    this.initializeDropdowns();
  }

  private initializeDropdowns() {
    const dropdownButtons = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownButtons.forEach((button) => {
      const dropdown = new bootstrap.Dropdown(button, {
        offset: [0, 2],
        boundary: 'viewport',
        autoClose: true,
      });
    });
  }

  toggleExpand(blog: BlogDto) {
    blog.expanded = !blog.expanded;
  }

  toggleComments(blog: BlogDto) {
    blog.showComments = !blog.showComments;
    if (blog.showComments && (!blog.comments || blog.comments.length === 0)) {
      this.loadBlogComments(blog);
    }
  }

  private async loadBlogComments(blog: BlogDto) {
    try {
      const response = await this.blogService.getBlogComments(blog.blogId).toPromise();
      if (response?.data) {
        blog.comments = response.data;
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  addTag() {
    if (this.newTag.trim()) {
      const tag = this.newTag.trim();
      const cleanTag = tag.replace(/^#+/, '');
      const formattedTag = `#${cleanTag}`;
      if (!this.newBlog.tags.includes(formattedTag)) {
        this.newBlog.tags.push(formattedTag);
        this.newTag = '';
      }
    }
  }

  removeTag(tag: string) {
    this.newBlog.tags = this.newBlog.tags.filter((t: string) => t !== tag);
  }

  async postBlog() {
    if (this.newBlog.title && this.newBlog.content) {
      this.isLoading = true;
      try {
        if (this.isEditing && this.editingBlog) {
          const editBlogDto: EditBlogDto = {
            title: this.newBlog.title,
            content: this.newBlog.content,
            slug: this.newBlog.slug,
            summary: this.newBlog.summary,
            tags: this.newBlog.tags
          };
          
          const response = await this.blogService.updateBlog(this.editingBlog.blogId, editBlogDto).toPromise();
          if (response?.data) {
            const index = this.blogs.findIndex(b => b.blogId === this.editingBlog?.blogId);
            if (index !== -1) {
              this.blogs[index] = {
                ...response.data,
                showComments: false,
                newComment: '',
                expanded: false,
                showMoreButton: false
              };
            }
          }
        } else {
          const response = await this.blogService.createBlog(this.newBlog).toPromise();
          if (response?.data) {
            this.blogs.unshift({
              ...response.data,
              showComments: false,
              newComment: '',
              expanded: false,
              showMoreButton: false
            });
          }
        }

        this.filteredBlogs = [...this.blogs];
        this.resetBlogForm();
        this.updateBlogContentHeights();
      } catch (error) {
        console.error('Failed to post blog:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  filterBlogs(category: string) {
    this.filteredBlogs = category
      ? this.blogs.filter((blog) => blog.category === category)
      : [...this.blogs];
  }

  async likeBlog(blog: BlogDto) {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?.id) {
        console.error('User not authenticated');
        return;
      }

      const likeDto: CreateBlogLikeDto = {
        blogId: blog.blogId,
        userId: currentUser.id
      };
      
      const response = await this.blogService.likeBlog(likeDto).toPromise();
      if (response?.data) {
        const index = this.blogs.findIndex(b => b.blogId === blog.blogId);
        if (index !== -1) {
          if (this.blogs[index].likes === undefined) {
            this.blogs[index].likes = 0;
          }
          this.blogs[index].likes = response.data.isLiked ? this.blogs[index].likes + 1 : this.blogs[index].likes - 1;
        }
      }
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  }

  async postComment(blog: BlogDto) {
    if (blog.newComment?.trim()) {
      try {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser?.id) {
          console.error('User not authenticated');
          return;
        }

        const commentDto: CreateBlogCommentDto = {
          blogId: blog.blogId,
          userId: currentUser.id,
          text: blog.newComment
        };

        const response = await this.blogService.postComment(commentDto).toPromise();
        if (response?.data) {
          if (!blog.comments) {
            blog.comments = [];
          }
          blog.comments.push(response.data);
          blog.newComment = '';
        }
      } catch (error) {
        console.error('Failed to post comment:', error);
      }
    }
  }

  async deleteBlog(blog: BlogDto) {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        await this.blogService.deleteBlog(blog.blogId).toPromise();
        const index = this.blogs.findIndex(b => b.blogId === blog.blogId);
        if (index !== -1) {
          this.blogs.splice(index, 1);
          this.filteredBlogs = [...this.blogs];
        }
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  }

  editBlog(blog: BlogDto) {
    this.editingBlog = blog;
    this.newBlog = {
      authorId: blog.authorId,
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      summary: blog.summary,
      tags: blog.tags || []
    };
    this.isBlogForm = false;
    this.isEditing = true;
  }

  private resetBlogForm() {
    const currentUser = this.authService.getCurrentUser();
    this.newBlog = {
      authorId: currentUser?.id || '',
      title: '',
      content: '',
      slug: '',
      summary: '',
      tags: []
    };
    this.newTag = '';
    this.isEditing = false;
    this.editingBlog = null;
  }

  toggleBlogForm() {
    this.isBlogForm = !this.isBlogForm;
    if (!this.isBlogForm) {
      this.resetBlogForm();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
