import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }
  reviewUrl: string = 'api/reviews';
  private  creteReviewUrl = environment.apiUrl + `${this.reviewUrl}`;
  
  createReview(review: any) {
    return this.http.post(this.creteReviewUrl, review);
  }
}
