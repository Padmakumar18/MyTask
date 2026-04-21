import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { LoginModel, RegisterModel, User, UserEntity } from '../../models/auth.model';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async login(loginData: LoginModel): Promise<UserEntity | string> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginData.email)
      .single();

    if (error || !data) {
      return 'User not found';
    }

    const isValid = bcrypt.compareSync(loginData.password, data.password_hash);

    if (!isValid) {
      return 'Invalid password';
    }

    return data;
  }

  async register(registerData: RegisterModel): Promise<UserEntity | string> {
    if (registerData.password !== registerData.confirmPassword) {
      return 'Passwords do not match';
    }

    const supabase = this.supabaseService.getClient();

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(registerData.password, salt);

    const user: User = {
      email: registerData.email,
      name: registerData.name,
      password_hash: hash,
      salt: salt,
    };

    const { data, error } = await supabase.from('users').insert([user]).select().single();

    if (error) {
      return 'Registration failed';
    }

    return data;
  }
}
