import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginModel, RegisterModel, User, UserEntity } from '../../models/auth.model';
import * as bcrypt from 'bcryptjs';
import { toast } from 'ngx-sonner';
import { SupabaseService } from '../../services/supabase';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private readonly userService = inject(UserService);
  isLoginMode = signal(true);
  loginForm: FormGroup;
  registerForm: FormGroup;

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['test@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      name: ['Test', [Validators.required, Validators.minLength(2)]],
      email: ['test@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['123456', [Validators.required]],
    });
  }

  async onLogin() {
    if (!this.loginForm.valid) return;

    const loginData: LoginModel = this.loginForm.value;
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginData.email)
      .single();

    if (error || !data) {
      toast.error('User not found');
      return;
    }
    console.log(data);

    const isValid = await this.verifyPassword(loginData.password, data.password_hash);

    if (!isValid) {
      toast.error('Invalid password');
      return;
    }

    const registerdUser: UserEntity = data;

    toast.success('Login successful');
    console.log('Logged in user:', data);
    this.setUser(registerdUser.user_id, registerdUser.email);

    this.router.navigate(['/']);
  }

  async onRegister() {
    if (!this.registerForm.valid) return;

    const registerData: RegisterModel = this.registerForm.value;

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const supabase = this.supabaseService.getClient();

    const hashAndSalt = await this.hashPassword(registerData.password);

    const user: User = {
      email: registerData.email,
      name: registerData.name,
      password_hash: hashAndSalt.hash,
      salt: hashAndSalt.salt,
    };

    const { data, error } = await supabase.from('users').insert([user]).select().single();

    if (error) {
      toast.error('Registration failed');
      console.error(error);
      return;
    }

    const createdUser: UserEntity = data;

    toast.success('User registered successfully');
    this.registerForm.reset();
    this.isLoginMode.set(true);

    this.setUser(createdUser.user_id, createdUser.email);
  }

  setUser(userId: string, email: string) {
    this.userService.setUserId(userId);
    this.userService.setAuthenticated(true);
    this.userService.setUserEmail(email);
  }

  async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return { hash, salt };
  }

  async verifyPassword(inputPassword: string, storedHash: string) {
    return bcrypt.compareSync(inputPassword, storedHash);
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
}
