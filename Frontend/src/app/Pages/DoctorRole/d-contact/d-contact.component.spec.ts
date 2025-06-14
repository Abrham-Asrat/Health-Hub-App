import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DContactComponent } from './d-contact.component';

describe('DContactComponent', () => {
  let component: DContactComponent;
  let fixture: ComponentFixture<DContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
