import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PAppointmentComponent } from './p-appointment.component';

describe('PAppointmentComponent', () => {
  let component: PAppointmentComponent;
  let fixture: ComponentFixture<PAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
