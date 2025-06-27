import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AMessagesComponent } from './a-messages.component';

describe('AMessagesComponent', () => {
  let component: AMessagesComponent;
  let fixture: ComponentFixture<AMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
