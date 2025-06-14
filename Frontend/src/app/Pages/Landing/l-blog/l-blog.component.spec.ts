import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LBlogComponent } from './l-blog.component';

describe('LBlogComponent', () => {
  let component: LBlogComponent;
  let fixture: ComponentFixture<LBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
