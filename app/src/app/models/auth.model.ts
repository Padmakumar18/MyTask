export interface LoginModel {
  email: string;
  password: string;
}

export interface RegisterModel {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  email: string;
  name: string;
  password_hash: string;
  salt: string;
}

export interface UserEntity {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
}
