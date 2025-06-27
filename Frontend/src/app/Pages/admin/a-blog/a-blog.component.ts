import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  status: 'Published' | 'Pending' | 'Rejected';
  createdAt: Date;
}

@Component({
  selector: 'app-a-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './a-blog.component.html',
  styleUrls: ['./a-blog.component.css']
})
export class ABlogComponent {
  searchTerm: string = '';

  blogPosts: BlogPost[] = [
    { id: 1, title: 'welcome to hospital blog', author: 'Admin', category: 'Health', status: 'Published', createdAt: new Date('2025-01-10') },
    { id: 2, title: 'covid-19 updates', author: 'Editor', category: 'News', status: 'Pending', createdAt: new Date('2025-05-01') },
    { id: 3, title: 'mental health tips', author: 'Admin', category: 'Health', status: 'Rejected', createdAt: new Date('2025-03-15') },
  ];

  filteredPosts(): BlogPost[] {
    if (!this.searchTerm) {
      return this.blogPosts;
    }
    const term = this.searchTerm.toLowerCase();
    return this.blogPosts.filter(post =>
      post.title.toLowerCase().includes(term) ||
      post.author.toLowerCase().includes(term) ||
      post.category.toLowerCase().includes(term)
    );
  }

  approvePost(post: BlogPost) {
    post.status = 'Published';
    alert(`Post "${post.title}" approved.`);
    // Here you'd call a backend API
  }

  rejectPost(post: BlogPost) {
    post.status = 'Rejected';
    alert(`Post "${post.title}" rejected.`);
    // Here you'd call a backend API
  }

  deletePost(post: BlogPost) {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      this.blogPosts = this.blogPosts.filter(p => p.id !== post.id);
      alert(`Post "${post.title}" deleted.`);
      // Here you'd call a backend API
    }
  }
}
