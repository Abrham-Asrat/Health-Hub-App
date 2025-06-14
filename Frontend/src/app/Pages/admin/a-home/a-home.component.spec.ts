import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AHomeComponent } from './a-home.component';

describe('AHomeComponent', () => {
  let component: AHomeComponent;
  let fixture: ComponentFixture<AHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
