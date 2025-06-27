import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AReviewComponent } from './a-review.component';

describe('AReviewComponent', () => {
  let component: AReviewComponent;
  let fixture: ComponentFixture<AReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
