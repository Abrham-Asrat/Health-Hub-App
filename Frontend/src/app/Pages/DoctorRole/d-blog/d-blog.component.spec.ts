import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DBlogComponent } from './d-blog.component';

describe('DBlogComponent', () => {
  let component: DBlogComponent;
  let fixture: ComponentFixture<DBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
