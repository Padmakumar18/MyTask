import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartItemsService } from '../../services/core/cart-items.service';
import { CartItem } from '../../models/cart-item.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart-items.html',
  styleUrl: './cart-items.css',
})
export class CartItems implements OnInit {
  private items = signal<CartItem[]>([]);

  categoryId = signal<string>('');
  categoryName = signal<string>('');
  isAddingItem = signal(false);
  isEditingItem = signal(false);
  selectedItem = signal<CartItem | null>(null);
  itemToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);

  itemForm: FormGroup;

  private fb = inject(FormBuilder);
  private itemsService = inject(CartItemsService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  // Computed properties
  allItems = this.items.asReadonly();

  totalPrice = computed(() => {
    return this.items().reduce((total, item) => total + Number(item.price), 0);
  });

  itemCount = computed(() => this.items().length);

  constructor() {
    this.itemForm = this.fb.group({
      product_name: ['', [Validators.required, Validators.maxLength(255)]],
      price: ['', [Validators.required, Validators.min(0)]],
      product_link: [''],
    });
  }

  async ngOnInit() {
    const userId = this.userService.getUserId();
    if (!userId) {
      console.warn('Cart Items - No user found');
      toast.warning('Please log in to manage your cart items');
      return;
    }

    // Get category ID from route params
    this.route.params.subscribe((params) => {
      const catId = params['categoryId'];
      if (catId) {
        this.categoryId.set(catId);
        this.loadItems();
      }
    });

    // Get category name from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (this.location.getState() as any);
    if (state?.categoryName) {
      this.categoryName.set(state.categoryName);
    }
  }

  async loadItems() {
    const catId = this.categoryId();
    if (!catId) return;

    this.isLoading.set(true);
    try {
      const items = await this.itemsService.getItemsByCategory(catId);
      this.items.set(items);
    } catch (error) {
      toast.error('Failed to load items');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showAddItemForm() {
    this.isAddingItem.set(true);
    this.isEditingItem.set(false);
    this.selectedItem.set(null);
    this.itemForm.reset();
  }

  cancelItemForm() {
    this.isAddingItem.set(false);
    this.isEditingItem.set(false);
    this.selectedItem.set(null);
    this.itemForm.reset();
  }

  async addItem() {
    const userId = this.userService.getUserId();

    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      toast.error('Please fill in all required fields');
      return;
    }

    const catId = this.categoryId();
    if (!catId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.itemForm.value;

      await this.itemsService.addItem(catId, {
        product_name: formValue.product_name.trim(),
        price: Number(formValue.price),
        product_link: formValue.product_link?.trim() || undefined,
      });

      await this.loadItems();
      this.isAddingItem.set(false);
      this.itemForm.reset();
      toast.success('Item added successfully!');
    } catch (error) {
      toast.error('Failed to add item');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditItemForm(item: CartItem) {
    this.selectedItem.set(item);
    this.isEditingItem.set(true);
    this.isAddingItem.set(true);
    this.itemForm.patchValue({
      product_name: item.product_name,
      price: item.price,
      product_link: item.product_link || '',
    });
  }

  async updateItem() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      toast.error('Please fill in all required fields');
      return;
    }

    const itemId = this.selectedItem()?.cart_item_id;
    if (!itemId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.itemForm.value;

      await this.itemsService.updateItem(itemId, {
        product_name: formValue.product_name.trim(),
        price: Number(formValue.price),
        product_link: formValue.product_link?.trim() || undefined,
      });

      await this.loadItems();
      this.isAddingItem.set(false);
      this.isEditingItem.set(false);
      this.selectedItem.set(null);
      this.itemForm.reset();
      toast.success('Item updated successfully!');
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showDeleteConfirmation(itemId: string) {
    this.itemToDelete.set(itemId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.itemToDelete.set(null);
  }

  async confirmDelete() {
    const itemId = this.itemToDelete();
    if (!itemId) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.itemsService.deleteItem(itemId);
      await this.loadItems();
      toast.success('Item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    } finally {
      this.isLoading.set(false);
      this.isDeleteConfirmOpen.set(false);
      this.itemToDelete.set(null);
    }
  }

  deleteItem(itemId: string) {
    this.showDeleteConfirmation(itemId);
  }

  openProductLink(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/cart-categories']);
  }
}
