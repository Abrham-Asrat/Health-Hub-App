import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PChatComponent } from './p-chat.component';

describe('PChatComponent', () => {
  let component: PChatComponent;
  let fixture: ComponentFixture<PChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
