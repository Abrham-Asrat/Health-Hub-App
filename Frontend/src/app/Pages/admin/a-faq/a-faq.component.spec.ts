import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AFaqComponent } from './a-faq.component';

describe('AFaqComponent', () => {
  let component: AFaqComponent;
  let fixture: ComponentFixture<AFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AFaqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
