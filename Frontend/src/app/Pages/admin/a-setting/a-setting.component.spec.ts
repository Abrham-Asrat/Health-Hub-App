import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASettingComponent } from './a-setting.component';

describe('ASettingComponent', () => {
  let component: ASettingComponent;
  let fixture: ComponentFixture<ASettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
