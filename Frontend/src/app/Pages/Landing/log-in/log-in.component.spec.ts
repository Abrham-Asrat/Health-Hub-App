import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './log-in.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default values correctly', () => {
    expect(component.isPatient).toBeFalse();
    expect(component.toggle).toBe('Patient');
    expect(component.loginToggler).toBe('Doctor');
  });

  it('should toggle roles when signUpChanger is called', () => {
    component.signUpChanger(true);
    expect(component.isPatient).toBeTrue();
    expect(component.toggle).toBe('Doctor');
    expect(component.loginToggler).toBe('Patient');
  });

  it('should validate empty email or password', () => {
    spyOn(window, 'alert');
    component.loginData.email = '';
    component.loginData.password = '';
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith(
      'Please enter both email and password.'
    );
  });

  it('should open OTP modal if login credentials are valid', () => {
    component.loginData.email = 'ab@gmail.com';
    component.loginData.password = '123';
    const modalSpy = spyOn(window as any, 'bootstrap').and.callFake(() => ({
      hide: () => {},
      show: () => {},
    }));
    component.onSubmit();
    expect(modalSpy).toHaveBeenCalled();
  });
});
