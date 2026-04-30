import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeLayout {
  private readonly userService = inject(UserService);
  isMobileMenuOpen = signal(false);
  activeRoute = signal('tasks');

  navItems = [
    { path: 'tasks', label: 'Task' },
    { path: 'cart-categories', label: 'Cart' },
    { path: 'events', label: 'Events' },
    { path: 'week-days', label: 'Week Days' },
    { path: 'weekend-days', label: 'Weekend Days' },
    { path: 'skills', label: 'Skills' },
    { path: 'youtube-categories', label: 'Watch Later' },
  ];

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
  ) {}

  navigateTo(path: string) {
    this.activeRoute.set(path);
    this.router.navigate([path]);
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  onLogout() {
    this.userService.logout();
    toast.success('Logged out successfully');
    this.router.navigate(['/auth']);
  }
}
