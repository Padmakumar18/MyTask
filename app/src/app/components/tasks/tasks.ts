import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../models/task.model';
import { toast } from 'ngx-sonner';
import { TaskService } from '../../services/core/task.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  private taskService = inject(TaskService);
  private userService = inject(UserService);

  tasks = signal<Task[]>([]);
  isAddingTask = signal(false);
  selectedTask = signal<Task | null>(null);
  isTaskDetailOpen = signal(false);
  isDeleteConfirmOpen = signal(false);
  taskToDelete = signal<string | null>(null);

  taskForm: FormGroup;

  pendingTasks = computed(() => this.tasks().filter((t) => t.status === 'pending'));
  ongoingTasks = computed(() => this.tasks().filter((t) => t.status === 'ongoing'));
  completedTasks = computed(() => this.tasks().filter((t) => t.status === 'completed'));

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.loadTasks();
  }

  async loadTasks() {
    try {
      const userId = this.userService.getUserId();
      const tasks = await this.taskService.getTasks(userId);
      this.tasks.set(tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  }

  showAddTaskForm() {
    this.isAddingTask.set(true);
  }

  cancelAddTask() {
    this.isAddingTask.set(false);
    this.taskForm.reset();
  }

  async addTask() {
    if (this.taskForm.invalid) return;

    try {
      const userId = this.userService.getUserId();

      const task = await this.taskService.addTask(
        userId,
        this.taskForm.value.title,
        this.taskForm.value.description,
      );

      this.tasks.update((t) => [task, ...t]);

      toast.success('Task created');

      this.cancelAddTask();
    } catch {
      toast.error('Failed to create task');
    }
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    try {
      const updated = await this.taskService.updateTaskStatus(taskId, status);

      this.tasks.update((tasks) => tasks.map((t) => (t.task_id === taskId ? updated : t)));

      toast.success('Task updated');
    } catch {
      toast.error('Update failed');
    }
  }

  openTaskDetail(task: Task) {
    this.selectedTask.set(task);
    this.isTaskDetailOpen.set(true);
  }

  closeTaskDetail() {
    this.isTaskDetailOpen.set(false);
    this.selectedTask.set(null);
  }

  async updateTaskStatusFromDetail(status: TaskStatus) {
    const task = this.selectedTask();
    if (!task) return;

    await this.updateTaskStatus(task.task_id, status);
    this.selectedTask.set({ ...task, status });
  }

  deleteTaskFromDetail() {
    const task = this.selectedTask();
    if (!task) return;

    this.taskToDelete.set(task.task_id);
    this.isDeleteConfirmOpen.set(true);
  }

  deleteTask(taskId: string) {
    this.taskToDelete.set(taskId);
    this.isDeleteConfirmOpen.set(true);
  }

  async confirmDelete() {
    const taskId = this.taskToDelete();
    if (!taskId) return;

    try {
      await this.taskService.deleteTask(taskId);

      this.tasks.update((tasks) => tasks.filter((t) => t.task_id !== taskId));

      toast.success('Task deleted');

      this.closeTaskDetail();
      this.cancelDelete();
    } catch {
      toast.error('Delete failed');
    }
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  getNextStatus(status: TaskStatus): TaskStatus | null {
    const statusFlow: Record<TaskStatus, TaskStatus | null> = {
      pending: 'ongoing',
      ongoing: 'completed',
      completed: null,
    };
    return statusFlow[status];
  }

  getPreviousStatus(status: TaskStatus): TaskStatus | null {
    const statusFlow: Record<TaskStatus, TaskStatus | null> = {
      pending: null,
      ongoing: 'pending',
      completed: 'ongoing',
    };
    return statusFlow[status];
  }

  async editTask(taskId: string) {
    if (this.taskForm.invalid) return;

    try {
      const updated = await this.taskService.updateTask(
        taskId,
        this.taskForm.value.title,
        this.taskForm.value.description,
      );

      this.tasks.update((tasks) => tasks.map((t) => (t.task_id === taskId ? updated : t)));

      toast.success('Task updated');
    } catch {
      toast.error('Update failed');
    }
  }
}
