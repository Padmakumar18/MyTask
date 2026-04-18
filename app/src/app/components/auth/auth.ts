import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginModel, RegisterModel } from '../../models/auth.model';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  isLoginMode = signal(true);
  loginForm: FormGroup;
  registerForm: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onLogin() {
    if (this.loginForm.valid) {
      const loginData: LoginModel = this.loginForm.value;
      console.log('Login:', loginData);
      // Add your login logic here
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const registerData: RegisterModel = this.registerForm.value;
      if (registerData.password !== registerData.confirmPassword) {
        console.error('Passwords do not match');
        return;
      }
      console.log('Register:', registerData);
      // Add your register logic here
    }
  }
}
