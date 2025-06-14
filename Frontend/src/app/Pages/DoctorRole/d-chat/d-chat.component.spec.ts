import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DChatComponent } from './d-chat.component';

describe('DChatComponent', () => {
  let component: DChatComponent;
  let fixture: ComponentFixture<DChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
