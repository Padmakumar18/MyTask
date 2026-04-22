import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginModel, RegisterModel, UserEntity } from '../../models/auth.model';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';
import { AuthService } from '../../services/core/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  loginForm: FormGroup;
  registerForm: FormGroup;

  isLoginMode = signal(true);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['test@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      name: ['test', [Validators.required]],
      email: ['test@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
      confirmPassword: ['123456', [Validators.required]],
    });
  }

  async onLogin() {
    if (!this.loginForm.valid) return;
    const loadingToast = toast.loading('Logging in...');
    const loginData: LoginModel = this.loginForm.value;
    const response = await this.authService.login(loginData);
    if (typeof response === 'string') {
      toast.error(response);
      return;
    }
    const user: UserEntity = response;
    this.setUser(user.user_id, user.email);
    toast.success('Login successful', {
      id: loadingToast,
    });
    this.router.navigate(['/']);
  }

  async onRegister() {
    if (!this.registerForm.valid) return;
    const registerData: RegisterModel = this.registerForm.value;
    const loadingToast = toast.loading('Loading...');
    const response = await this.authService.register(registerData);
    if (typeof response === 'string') {
      toast.error(response);
      return;
    }
    const user: UserEntity = response;
    this.setUser(user.user_id, user.email);
    toast.success('User registered successfully', {
      id: loadingToast,
    });
    this.registerForm.reset();
    this.isLoginMode.set(true);
    this.router.navigate(['/']);
  }

  setUser(userId: string, email: string) {
    this.userService.setUserId(userId);
    this.userService.setAuthenticated(true);
    this.userService.setUserEmail(email);
  }

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
