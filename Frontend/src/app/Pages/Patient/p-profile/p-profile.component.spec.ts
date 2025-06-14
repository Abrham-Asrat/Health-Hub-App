import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PProfileComponent } from './p-profile.component';

describe('PProfileComponent', () => {
  let component: PProfileComponent;
  let fixture: ComponentFixture<PProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
