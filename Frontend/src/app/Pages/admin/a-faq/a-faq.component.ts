import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faSearch, faChevronDown, faChevronUp, faEdit, faTrashAlt, faCheckCircle, faTimesCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  isApproved: boolean;
  isEditing?: boolean;
  editedAnswer?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-a-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './a-faq.component.html',
  styleUrls: ['./a-faq.component.css']
})
export class AFAQComponent implements OnInit {
  // Font Awesome Icons
  faPlus = faPlus;
  faSearch = faSearch;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faQuestionCircle = faQuestionCircle;

  // Component State
  faqs: FAQ[] = [];
  filteredFAQs: FAQ[] = [];
  searchQuery: string = '';
  showAddForm: boolean = false;
  showDeleteConfirmation: boolean = false;
  faqToDeleteIndex: number | null = null;

  newFAQ: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'> = {
    question: '',
    answer: '',
    isOpen: false,
    isApproved: false
  };

  ngOnInit(): void {
    // Initialize with sample data or fetch from API
    this.loadSampleFAQs();
    this.filterFAQs();
  }

  loadSampleFAQs(): void {
    this.faqs = [
      {
        id: '1',
        question: 'How do I book an appointment with a doctor?',
        answer: 'You can book an appointment by searching for a doctor in the search bar, selecting your preferred doctor, and choosing an available time slot from their calendar.',
        isOpen: false,
        isApproved: true,
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2023-05-15')
      },
      {
        id: '2',
        question: 'What payment methods are accepted?',
        answer: 'We accept various payment methods including credit/debit cards, mobile money, and bank transfers through our secure payment gateway.',
        isOpen: false,
        isApproved: true,
        createdAt: new Date('2023-06-20'),
        updatedAt: new Date('2023-06-22')
      },
      {
        id: '3',
        question: 'Can I cancel or reschedule my appointment?',
        answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through your appointments dashboard.',
        isOpen: false,
        isApproved: false,
        createdAt: new Date('2023-07-10'),
        updatedAt: new Date('2023-07-10')
      }
    ];
  }

  filterFAQs(): void {
    if (!this.searchQuery) {
      this.filteredFAQs = [...this.faqs];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredFAQs = this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetNewFAQ();
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.resetNewFAQ();
  }

  resetNewFAQ(): void {
    this.newFAQ = {
      question: '',
      answer: '',
      isOpen: false,
      isApproved: false
    };
  }

  isValidFAQ(): boolean {
    return this.newFAQ.question.trim().length > 0 && 
           this.newFAQ.answer.trim().length > 0;
  }

  addFAQ(): void {
    if (!this.isValidFAQ()) return;

    const newFAQ: FAQ = {
      ...this.newFAQ,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      editedAnswer: this.newFAQ.answer
    };

    this.faqs.unshift(newFAQ);
    this.filterFAQs();
    this.showAddForm = false;
    this.resetNewFAQ();
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  toggleFAQ(index: number): void {
    this.filteredFAQs[index].isOpen = !this.filteredFAQs[index].isOpen;
  }

  toggleApproval(index: number): void {
    const originalIndex = this.findOriginalIndex(this.filteredFAQs[index].id);
    if (originalIndex !== -1) {
      this.faqs[originalIndex].isApproved = !this.faqs[originalIndex].isApproved;
      this.faqs[originalIndex].updatedAt = new Date();
      this.filterFAQs();
    }
  }

  startEdit(index: number): void {
    const originalIndex = this.findOriginalIndex(this.filteredFAQs[index].id);
    if (originalIndex !== -1) {
      this.faqs[originalIndex].isEditing = true;
      this.faqs[originalIndex].editedAnswer = this.faqs[originalIndex].answer;
      this.filterFAQs();
    }
  }

  saveFAQ(index: number): void {
    const originalIndex = this.findOriginalIndex(this.filteredFAQs[index].id);
    if (originalIndex !== -1) {
      this.faqs[originalIndex].answer = this.faqs[originalIndex].editedAnswer || '';
      this.faqs[originalIndex].isEditing = false;
      this.faqs[originalIndex].updatedAt = new Date();
      this.filterFAQs();
    }
  }

  cancelEdit(index: number): void {
    const originalIndex = this.findOriginalIndex(this.filteredFAQs[index].id);
    if (originalIndex !== -1) {
      this.faqs[originalIndex].isEditing = false;
      this.filterFAQs();
    }
  }

  confirmDelete(index: number): void {
    this.faqToDeleteIndex = this.findOriginalIndex(this.filteredFAQs[index].id);
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.faqToDeleteIndex = null;
  }

  deleteFAQ(): void {
    if (this.faqToDeleteIndex !== null && this.faqToDeleteIndex !== -1) {
      this.faqs.splice(this.faqToDeleteIndex, 1);
      this.filterFAQs();
    }
    this.showDeleteConfirmation = false;
    this.faqToDeleteIndex = null;
  }

  findOriginalIndex(id: string): number {
    return this.faqs.findIndex(faq => faq.id === id);
  }
}