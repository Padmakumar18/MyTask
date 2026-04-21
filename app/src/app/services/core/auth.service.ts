import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { LoginModel, UserEntity } from '../../models/auth.model';
import bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async Login(loginData: LoginModel) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginData.email)
      .single();

    if (error || !data) {
      //   toast.error('User not found');
      return 'User not found';
    }

    const isValid = await this.verifyPassword(loginData.password, data.password_hash);
    if (!isValid) {
      return 'Invalid password';
    }

    return data;
  }

  private async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return { hash, salt };
  }

  private async verifyPassword(inputPassword: string, storedHash: string) {
    return bcrypt.compareSync(inputPassword, storedHash);
  }
}
