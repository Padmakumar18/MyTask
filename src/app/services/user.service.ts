import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly AUTH_KEY = 'isAuthenticated';
  private readonly USER_ID_KEY = 'userId';
  private readonly USER_EMAIL_KEY = 'userEmail';

  private isAuthenticatedSignal = signal<boolean>(this.getStoredAuthStatus());
  private userIdSignal = signal<string | null>(this.getStoredUserId());
  private userEmail = signal<string | null>(this.getStoredUserEmail());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const isAuth = this.getStoredAuthStatus();
    const userId = this.getStoredUserId();
    const email = this.getStoredUserEmail();

    if (isAuth && userId && email) {
      this.isAuthenticatedSignal.set(true);
      this.userIdSignal.set(userId);
      this.userEmail.set(email);
    }
  }

  private getStoredAuthStatus(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.AUTH_KEY) === 'true';
    }
    return false;
  }

  private getStoredUserId(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.USER_ID_KEY);
    }
    return null;
  }

  private getStoredUserEmail(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.USER_EMAIL_KEY);
    }
    return null;
  }

  isAuthenticated() {
    return this.isAuthenticatedSignal();
  }

  getUserId() {
    return this.userIdSignal();
  }

  getUserEmail() {
    return this.userEmail();
  }

  setAuthenticated(status: boolean) {
    this.isAuthenticatedSignal.set(status);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.AUTH_KEY, status.toString());
    }
  }

  setUserId(id: string) {
    this.userIdSignal.set(id);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_ID_KEY, id);
    }
  }

  setUserEmail(userEmail: string) {
    this.userEmail.set(userEmail);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_EMAIL_KEY, userEmail);
    }
  }

  login(userId: string, email: string) {
    this.userIdSignal.set(userId);
    this.userEmail.set(email);
    this.isAuthenticatedSignal.set(true);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.USER_ID_KEY, userId);
      localStorage.setItem(this.USER_EMAIL_KEY, email);
      localStorage.setItem(this.AUTH_KEY, 'true');
    }
  }

  logout() {
    this.userIdSignal.set(null);
    this.userEmail.set(null);
    this.isAuthenticatedSignal.set(false);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.AUTH_KEY);
      localStorage.removeItem(this.USER_ID_KEY);
      localStorage.removeItem(this.USER_EMAIL_KEY);
    }
  }
}
