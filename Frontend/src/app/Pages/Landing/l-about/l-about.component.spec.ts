import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LAboutComponent } from './l-about.component';

describe('LAboutComponent', () => {
  let component: LAboutComponent;
  let fixture: ComponentFixture<LAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LAboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
