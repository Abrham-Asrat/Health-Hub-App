import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AAppointmentComponent } from './a-appointment.component';

describe('AAppointmentComponent', () => {
  let component: AAppointmentComponent;
  let fixture: ComponentFixture<AAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});