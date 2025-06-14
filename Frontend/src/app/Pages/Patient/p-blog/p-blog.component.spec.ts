import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PBlogComponent } from './p-blog.component';

describe('PBlogComponent', () => {
  let component: PBlogComponent;
  let fixture: ComponentFixture<PBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
