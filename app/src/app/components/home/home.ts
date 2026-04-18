import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../models/task.model';
import { toast } from 'ngx-sonner';

type NavItem = 'Task' | 'Cart' | 'Events' | 'Week Days' | 'Weekend Days';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  activeTab = signal<NavItem>('Task');
  isMobileMenuOpen = signal(false);
  tasks = signal<Task[]>([]);
  isAddingTask = signal(false);
  selectedTask = signal<Task | null>(null);
  isTaskDetailOpen = signal(false);
  isDeleteConfirmOpen = signal(false);
  taskToDelete = signal<string | null>(null);

  taskForm: FormGroup;

  navItems: NavItem[] = ['Task', 'Cart', 'Events', 'Week Days', 'Weekend Days'];
  taskStatuses: TaskStatus[] = ['Pending', 'Ongoing', 'Completed'];

  pendingTasks = computed(() => this.tasks().filter((t) => t.status === 'Pending'));
  ongoingTasks = computed(() => this.tasks().filter((t) => t.status === 'Ongoing'));
  completedTasks = computed(() => this.tasks().filter((t) => t.status === 'Completed'));

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  selectTab(tab: NavItem) {
    this.activeTab.set(tab);
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  showAddTaskForm() {
    this.isAddingTask.set(true);
    this.taskForm.reset();
  }

  cancelAddTask() {
    this.isAddingTask.set(false);
    this.taskForm.reset();
  }

  addTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.taskForm.value;
    const newTask: Task = {
      id: Date.now().toString(),
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      status: 'Pending',
      createdAt: new Date(),
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
    this.isAddingTask.set(false);
    this.taskForm.reset();
    toast.success('Task added successfully!');
  }

  openTaskDetail(task: Task) {
    this.selectedTask.set(task);
    this.isTaskDetailOpen.set(true);
  }

  closeTaskDetail() {
    this.isTaskDetailOpen.set(false);
    this.selectedTask.set(null);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    const task = this.tasks().find((t) => t.id === taskId);
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
    );
    if (task) {
      toast.success(`Task moved to ${newStatus}!`);
    }
  }

  showDeleteConfirmation(taskId: string) {
    this.taskToDelete.set(taskId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  confirmDelete() {
    const taskId = this.taskToDelete();
    if (taskId) {
      const task = this.tasks().find((t) => t.id === taskId);
      this.tasks.update((tasks) => tasks.filter((task) => task.id !== taskId));
      if (this.selectedTask()?.id === taskId) {
        this.closeTaskDetail();
      }
      if (task) {
        toast.success('Task deleted successfully!');
      }
    }
    this.isDeleteConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  deleteTask(taskId: string) {
    this.showDeleteConfirmation(taskId);
  }

  deleteTaskFromDetail() {
    const taskId = this.selectedTask()?.id;
    if (taskId) {
      this.showDeleteConfirmation(taskId);
    }
  }

  updateTaskStatusFromDetail(newStatus: TaskStatus) {
    const taskId = this.selectedTask()?.id;
    if (taskId) {
      this.updateTaskStatus(taskId, newStatus);
      const updatedTask = this.tasks().find((t) => t.id === taskId);
      if (updatedTask) {
        this.selectedTask.set(updatedTask);
      }
    }
  }

  getNextStatus(currentStatus: TaskStatus): TaskStatus | null {
    if (currentStatus === 'Pending') return 'Ongoing';
    if (currentStatus === 'Ongoing') return 'Completed';
    return null;
  }

  getPreviousStatus(currentStatus: TaskStatus): TaskStatus | null {
    if (currentStatus === 'Completed') return 'Ongoing';
    if (currentStatus === 'Ongoing') return 'Pending';
    return null;
  }
}
