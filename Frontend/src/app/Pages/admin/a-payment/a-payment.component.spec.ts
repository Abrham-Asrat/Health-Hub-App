import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APaymentComponent } from './a-payment.component';

describe('APaymentComponent', () => {
  let component: APaymentComponent;
  let fixture: ComponentFixture<APaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [APaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(APaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});