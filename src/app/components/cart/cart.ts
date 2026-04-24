import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/core/cart.service';
import { Cart as CartItem } from '../../models/cart.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems = signal<CartItem[]>([]);
  isAddingItem = signal(false);
  isEditingItem = signal(false);
  selectedItem = signal<CartItem | null>(null);
  itemToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);
  totalPrice = signal(0);

  cartForm: FormGroup;

  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private userService = inject(UserService);

  constructor() {
    this.cartForm = this.fb.group({
      product_name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0)]],
      product_link: [''],
    });
  }

  async ngOnInit() {
    // Get userId from UserService
    const userId = this.userService.getUserId();
    if (userId) {
      // console.log('Cart - User ID loaded:', userId);
      await this.loadCartItems();
    } else {
      console.warn('Cart - No user found');
      toast.warning('Please log in to use the cart');
    }
  }

  async loadCartItems() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    try {
      const items = await this.cartService.getCartItems(userId);
      this.cartItems.set(items);
      await this.calculateTotal();
    } catch (error) {
      toast.error('Failed to load cart items');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async calculateTotal() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    try {
      const total = await this.cartService.getTotalPrice(userId);
      this.totalPrice.set(total);
    } catch (error) {
      console.error('Failed to calculate total:', error);
    }
  }

  showAddItemForm() {
    this.isAddingItem.set(true);
    this.isEditingItem.set(false);
    this.selectedItem.set(null);
    this.cartForm.reset();
  }

  cancelItemForm() {
    this.isAddingItem.set(false);
    this.isEditingItem.set(false);
    this.selectedItem.set(null);
    this.cartForm.reset();
  }

  async addItem() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.cartForm.invalid) {
      this.cartForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.cartForm.value;
      await this.cartService.addCartItem(userId, {
        product_name: formValue.product_name.trim(),
        price: Number(formValue.price),
        product_link: formValue.product_link?.trim() || undefined,
      });

      await this.loadCartItems();
      this.isAddingItem.set(false);
      this.cartForm.reset();
      toast.success('Item added to cart successfully!');
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditItemForm(item: CartItem) {
    this.selectedItem.set(item);
    this.isEditingItem.set(true);
    this.isAddingItem.set(true);
    this.cartForm.patchValue({
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

    if (this.cartForm.invalid) {
      this.cartForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const itemId = this.selectedItem()?.cart_id;
    if (!itemId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.cartForm.value;
      await this.cartService.updateCartItem(itemId, {
        product_name: formValue.product_name.trim(),
        price: Number(formValue.price),
        product_link: formValue.product_link?.trim() || undefined,
      });

      await this.loadCartItems();
      this.isAddingItem.set(false);
      this.isEditingItem.set(false);
      this.selectedItem.set(null);
      this.cartForm.reset();
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
      await this.cartService.deleteCartItem(itemId);
      await this.loadCartItems();
      toast.success('Item removed from cart!');
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
}
