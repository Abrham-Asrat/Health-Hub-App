import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DProfileComponent } from './d-profile.component';

describe('DProfileComponent', () => {
  let component: DProfileComponent;
  let fixture: ComponentFixture<DProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
