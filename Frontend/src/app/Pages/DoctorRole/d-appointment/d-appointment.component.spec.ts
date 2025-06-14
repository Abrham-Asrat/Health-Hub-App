import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DAppointmentComponent } from './d-appointment.component';

describe('DAppointmentComponent', () => {
  let component: DAppointmentComponent;
  let fixture: ComponentFixture<DAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
