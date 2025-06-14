import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PContactUsComponent } from './p-contact-us.component';

describe('PContactUsComponent', () => {
  let component: PContactUsComponent;
  let fixture: ComponentFixture<PContactUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PContactUsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PContactUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
