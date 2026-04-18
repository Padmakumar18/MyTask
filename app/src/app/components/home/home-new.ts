import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-new.html',
  styleUrl: './home.css',
})
export class HomeLayout {
  isMobileMenuOpen = signal(false);
  activeRoute = signal('tasks');

  navItems = [
    { path: 'tasks', label: 'Task' },
    { path: 'cart', label: 'Cart' },
    { path: 'events', label: 'Events' },
    { path: 'week-days', label: 'Week Days' },
    { path: 'weekend-days', label: 'Weekend Days' },
    { path: 'skills', label: 'Skills' },
  ];

  constructor(private router: Router) {}

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
}
