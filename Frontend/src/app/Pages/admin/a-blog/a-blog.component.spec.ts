import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ABlogComponent } from './a-blog.component';

describe('ABlogComponent', () => {
  let component: ABlogComponent;
  let fixture: ComponentFixture<ABlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ABlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ABlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
