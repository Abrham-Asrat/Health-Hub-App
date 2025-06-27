import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define interfaces for review and comment data
interface Review {
  id: string;
  type: 'review'; // Consistent type
  authorId: string;
  authorName: string;
  doctorId: string;
  doctorName: string;
  content: string;
  rating: number;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface Comment {
  id: string;
  type: 'comment'; // Consistent type
  authorId: string;
  authorName: string;
  blogId: string;
  blogTitle: string;
  content: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
}

type ContentItem = Review | Comment;

@Component({
  selector: 'app-admin-review',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, DatePipe, TitleCasePipe],
  templateUrl: './a-review.component.html',
  styleUrls: ['./a-review.component.css']
})
export class ReviewComponent implements OnInit {
  // Simulate data from a backend
  private allContent: ContentItem[] = [
    {
      id: 'rev1', type: 'review', authorId: 'pat1', authorName: 'Alice Smith',
      doctorId: 'doc1', doctorName: 'Dr. Emily White', content: 'Dr. White was very thorough and helpful. Highly recommend!',
      rating: 5, date: new Date('2024-05-20T10:00:00Z'), status: 'approved'
    },
    {
      id: 'rev2', type: 'review', authorId: 'pat2', authorName: 'Bob Johnson',
      doctorId: 'doc2', doctorName: 'Dr. John Doe', content: 'Had a long wait time, but the consultation was good.',
      rating: 3, date: new Date('2024-05-21T11:30:00Z'), status: 'pending'
    },
    {
      id: 'com1', type: 'comment', authorId: 'pat3', authorName: 'Charlie Brown',
      blogId: 'blog1', blogTitle: 'Understanding Diabetes', content: 'Great article, very informative!',
      date: new Date('2024-05-22T14:00:00Z'), status: 'approved'
    },
    {
      id: 'rev3', type: 'review', authorId: 'pat4', authorName: 'Diana Prince',
      doctorId: 'doc1', doctorName: 'Dr. Emily White', content: 'Excellent doctor, very empathetic.',
      rating: 4, date: new Date('2024-05-23T09:15:00Z'), status: 'pending'
    },
    {
      id: 'com2', type: 'comment', authorId: 'doc3', authorName: 'Dr. House',
      blogId: 'blog2', blogTitle: 'New Approaches to Mental Health', content: 'Agreed, the research in this area is promising.',
      date: new Date('2024-05-24T16:45:00Z'), status: 'pending'
    },
    {
      id: 'rev4', type: 'review', authorId: 'pat5', authorName: 'Eve Adams',
      doctorId: 'doc4', doctorName: 'Dr. Grace Lee', content: 'Unprofessional, not recommended.',
      rating: 1, date: new Date('2024-05-25T13:00:00Z'), status: 'pending'
    },
  ];

  filteredContent: ContentItem[] = [];
  // CORRECTED: Type now matches 'review' | 'comment'
  selectedContentType: 'review' | 'comment' = 'review';
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  searchTerm: string = '';

  constructor() { }

  ngOnInit(): void {
    this.filterContent(); // Initial filter on load
  }

  /**
   * Filters the content based on selected type, status, and search term.
   */
  filterContent(): void {
    let tempContent = [...this.allContent]; // Work on a copy

    // 1. Filter by content type (reviews or comments)
    // This comparison is now valid due to type consistency
    tempContent = tempContent.filter(item => item.type === this.selectedContentType);

    // 2. Filter by status (all, pending, approved, rejected)
    if (this.statusFilter !== 'all') {
      tempContent = tempContent.filter(item => item.status === this.statusFilter);
    }

    // 3. Filter by search term (author name, doctor name, blog title, content)
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempContent = tempContent.filter(item => {
        const matchesAuthor = item.authorName.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesContent = item.content.toLowerCase().includes(lowerCaseSearchTerm);

        if (item.type === 'review') {
          const matchesDoctor = item.doctorName.toLowerCase().includes(lowerCaseSearchTerm);
          return matchesAuthor || matchesContent || matchesDoctor;
        } else { // type === 'comment'
          const matchesBlogTitle = item.blogTitle.toLowerCase().includes(lowerCaseSearchTerm);
          return matchesAuthor || matchesContent || matchesBlogTitle;
        }
      });
    }

    this.filteredContent = tempContent.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by newest first
  }

  /**
   * Updates the status of a content item (review or comment).
   * In a real application, this would involve an API call to the backend.
   * @param item The content item to update.
   * @param newStatus The new status to set.
   */
  updateStatus(item: ContentItem, newStatus: 'approved' | 'rejected'): void {
    // Simulate API call success
    const index = this.allContent.findIndex(content => content.id === item.id);
    if (index > -1) {
      this.allContent[index].status = newStatus;
      console.log(`${item.type} with ID ${item.id} status updated to ${newStatus}`);
      this.filterContent(); // Re-filter to reflect status change
      // In a real app: Call a service, e.g., this.adminService.updateContentStatus(item.id, newStatus).subscribe(...)
    }
  }

  /**
   * Deletes a content item (review or comment).
   * In a real application, this would involve an API call to the backend.
   * @param item The content item to delete.
   */
  deleteContent(item: ContentItem): void {
    if (confirm(`Are you sure you want to delete this ${item.type}?`)) {
      // Simulate API call success
      this.allContent = this.allContent.filter(content => content.id !== item.id);
      console.log(`${item.type} with ID ${item.id} deleted.`);
      this.filterContent(); // Re-filter to remove the deleted item
      // In a real app: Call a service, e.g., this.adminService.deleteContent(item.id).subscribe(...)
    }
  }
}