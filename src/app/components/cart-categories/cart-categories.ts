import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartCategoriesService } from '../../services/core/cart-categories.service';
import { CartCategory } from '../../models/cart-category.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-cart-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart-categories.html',
  styleUrl: './cart-categories.css',
})
export class CartCategories implements OnInit {
  private categories = signal<CartCategory[]>([]);

  isAddingCategory = signal(false);
  isEditingCategory = signal(false);
  selectedCategory = signal<CartCategory | null>(null);
  categoryToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);

  categoryForm: FormGroup;

  private fb = inject(FormBuilder);
  private categoriesService = inject(CartCategoriesService);
  private userService = inject(UserService);
  private router = inject(Router);

  allCategories = this.categories.asReadonly();

  constructor() {
    this.categoryForm = this.fb.group({
      category_name: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  async ngOnInit() {
    const userId = this.userService.getUserId();
    if (userId) {
      console.log('Cart Categories - User ID loaded:', userId);
      await this.loadCategories();
    } else {
      console.warn('Cart Categories - No user found');
      toast.warning('Please log in to manage your cart categories');
    }
  }

  async loadCategories() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    try {
      const categories = await this.categoriesService.getCategories(userId);
      this.categories.set(categories);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showAddCategoryForm() {
    this.isAddingCategory.set(true);
    this.isEditingCategory.set(false);
    this.selectedCategory.set(null);
    this.categoryForm.reset();
  }

  cancelCategoryForm() {
    this.isAddingCategory.set(false);
    this.isEditingCategory.set(false);
    this.selectedCategory.set(null);
    this.categoryForm.reset();
  }

  async addCategory() {
    const userId = this.userService.getUserId();

    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      toast.error('Please enter a valid category name');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.categoryForm.value;

      await this.categoriesService.createCategory(userId, {
        category_name: formValue.category_name.trim(),
      });

      await this.loadCategories();
      this.isAddingCategory.set(false);
      this.categoryForm.reset();
      toast.success('Category created successfully!');
    } catch (error) {
      toast.error('Failed to create category');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditCategoryForm(category: CartCategory) {
    this.selectedCategory.set(category);
    this.isEditingCategory.set(true);
    this.isAddingCategory.set(true);
    this.categoryForm.patchValue({
      category_name: category.category_name,
    });
  }

  async updateCategory() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      toast.error('Please enter a valid category name');
      return;
    }

    const categoryId = this.selectedCategory()?.category_id;
    if (!categoryId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.categoryForm.value;

      await this.categoriesService.updateCategory(categoryId, {
        category_name: formValue.category_name.trim(),
      });

      await this.loadCategories();
      this.isAddingCategory.set(false);
      this.isEditingCategory.set(false);
      this.selectedCategory.set(null);
      this.categoryForm.reset();
      toast.success('Category updated successfully!');
    } catch (error) {
      toast.error('Failed to update category');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showDeleteConfirmation(categoryId: string) {
    this.categoryToDelete.set(categoryId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.categoryToDelete.set(null);
  }

  async confirmDelete() {
    const categoryId = this.categoryToDelete();
    if (!categoryId) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.categoriesService.deleteCategory(categoryId);
      await this.loadCategories();
      toast.success('Category deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete category');
      console.error(error);
    } finally {
      this.isLoading.set(false);
      this.isDeleteConfirmOpen.set(false);
      this.categoryToDelete.set(null);
    }
  }

  deleteCategory(categoryId: string) {
    this.showDeleteConfirmation(categoryId);
  }

  openCategory(categoryId: string, categoryName: string) {
    this.router.navigate(['/cart-items', categoryId], {
      state: { categoryName },
    });
  }
}
