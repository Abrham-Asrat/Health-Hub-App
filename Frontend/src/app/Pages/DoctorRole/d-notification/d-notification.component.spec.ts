import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DNotificationComponent } from './d-notification.component';

describe('DNotificationComponent', () => {
  let component: DNotificationComponent;
  let fixture: ComponentFixture<DNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
