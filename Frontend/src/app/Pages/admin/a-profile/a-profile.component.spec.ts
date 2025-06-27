import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AProfileComponent } from './a-profile.component';

describe('AProfileComponent', () => {
  let component: AProfileComponent;
  let fixture: ComponentFixture<AProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
