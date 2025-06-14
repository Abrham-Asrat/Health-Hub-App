import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PLayoutComponent } from './p-layout.component';

describe('PLayoutComponent', () => {
  let component: PLayoutComponent;
  let fixture: ComponentFixture<PLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
