import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../Services/review.service';

declare var bootstrap: any;

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css',
})
export class RatingComponent {
  @Input() doctorId!: string;
  @Input() patientId!: string;
  @Output() reviewSubmitted = new EventEmitter<void>();

  starRating: number = 0;
  reviewText: string = '';

  constructor(
    private reviewService: ReviewService,
    private http: HttpClient
  ) {}

  setRating(star: number) {
    this.starRating = star;
  }

  async submitReview() {
    if (this.starRating === 0 || !this.reviewText.trim()) {
      alert('Please provide a rating and a review text.');
      return;
    }

    try {
      const reviewData = {
        doctorId: this.doctorId,
        patientId: this.patientId,
        starRating: this.starRating,
        reviewText: this.reviewText
      };

      await this.reviewService.createReview(reviewData).toPromise();
      
      alert('Thank you for your review!');
      this.resetForm();
      this.reviewSubmitted.emit();
      
      // Close modal if it exists
      const modal = document.getElementById('ratingModal');
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal?.hide();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  }

  resetForm() {
    this.starRating = 0;
    this.reviewText = '';
  }
}
