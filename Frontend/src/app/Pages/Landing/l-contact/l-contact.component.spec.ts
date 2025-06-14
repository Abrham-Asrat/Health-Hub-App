import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LContactComponent } from './l-contact.component';

describe('LContactComponent', () => {
  let component: LContactComponent;
  let fixture: ComponentFixture<LContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
