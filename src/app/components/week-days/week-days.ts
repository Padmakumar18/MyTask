import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeekdayTaskService } from '../../services/core/weekday-task.service';
import { WeekdayTask } from '../../models/weekday-task.model';
import { WEEK_DAYS, Weekday } from '../../models/weekday.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-week-days',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './week-days.html',
  styleUrl: './week-days.css',
})
export class WeekDays implements OnInit {
  private tasks = signal<WeekdayTask[]>([]);
  isAddingTask = signal(false);
  isEditingTask = signal(false);
  selectedTask = signal<WeekdayTask | null>(null);
  taskToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);
  isTaskDetailOpen = signal(false);
  taskDetailData = signal<WeekdayTask | null>(null);

  // Day selection
  selectedWeekday = signal<number>(1); // Default to Monday
  weekdays = WEEK_DAYS;

  taskForm: FormGroup;

  private fb = inject(FormBuilder);
  private weekdayTaskService = inject(WeekdayTaskService);
  private userService = inject(UserService);

  // Filter tasks by selected weekday
  filteredTasks = computed(() => {
    const selectedDay = this.selectedWeekday();
    return this.tasks().filter((task) => task.weekday_id === selectedDay);
  });

  // Statistics for selected day
  totalTasks = computed(() => this.filteredTasks().length);
  completedTasks = computed(() => this.filteredTasks().filter((t) => t.is_completed).length);
  pendingTasks = computed(() => this.filteredTasks().filter((t) => !t.is_completed).length);

  // Get selected day name
  selectedDayName = computed(() => {
    const day = this.weekdays.find((d) => d.weekday_id === this.selectedWeekday());
    return day?.day_name || 'Monday';
  });

  constructor() {
    this.taskForm = this.fb.group({
      weekday_id: [1, [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
  }

  async ngOnInit() {
    const userId = this.userService.getUserId();
    if (userId) {
      console.log('Week Days - User ID loaded:', userId);
      await this.loadTasks();
    } else {
      console.warn('Week Days - No user found');
      toast.warning('Please log in to view your weekly tasks');
    }
  }

  async loadTasks() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    try {
      // Load tasks for Monday to Friday (weekday_id 1-5)
      const tasks = await this.weekdayTaskService.getTasksByWeekdayRange(userId, 1, 5);
      this.tasks.set(tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectWeekday(weekdayId: number) {
    this.selectedWeekday.set(weekdayId);
  }

  showAddTaskForm() {
    this.isAddingTask.set(true);
    this.isEditingTask.set(false);
    this.selectedTask.set(null);
    this.taskForm.reset({
      weekday_id: this.selectedWeekday(),
      title: '',
      description: '',
    });
  }

  cancelTaskForm() {
    this.isAddingTask.set(false);
    this.isEditingTask.set(false);
    this.selectedTask.set(null);
    this.taskForm.reset();
  }

  async addTask() {
    const userId = this.userService.getUserId();

    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.taskForm.value;
      await this.weekdayTaskService.addTask(userId, {
        weekday_id: formValue.weekday_id,
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
      });

      await this.loadTasks();
      this.isAddingTask.set(false);
      this.taskForm.reset();
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Failed to add task');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditTaskForm(task: WeekdayTask) {
    this.selectedTask.set(task);
    this.isEditingTask.set(true);
    this.isAddingTask.set(true);
    this.taskForm.patchValue({
      weekday_id: task.weekday_id,
      title: task.title,
      description: task.description || '',
    });
  }

  async updateTask() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const taskId = this.selectedTask()?.task_id;
    if (!taskId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.taskForm.value;

      // Check if weekday changed
      const oldWeekdayId = this.selectedTask()?.weekday_id;
      const newWeekdayId = formValue.weekday_id;

      await this.weekdayTaskService.updateTask(taskId, {
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
      });

      // If weekday changed, we need to update it separately
      if (oldWeekdayId !== newWeekdayId) {
        // Delete and recreate task with new weekday_id
        const task = this.selectedTask();
        if (task) {
          await this.weekdayTaskService.deleteTask(taskId);
          await this.weekdayTaskService.addTask(userId, {
            weekday_id: newWeekdayId,
            title: formValue.title.trim(),
            description: formValue.description?.trim() || undefined,
          });
          toast.success('Task moved to ' + this.getWeekdayName(newWeekdayId) + '!');
        }
      } else {
        toast.success('Task updated successfully!');
      }

      await this.loadTasks();
      this.isAddingTask.set(false);
      this.isEditingTask.set(false);
      this.selectedTask.set(null);
      this.taskForm.reset();
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleTaskCompletion(task: WeekdayTask) {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    try {
      await this.weekdayTaskService.toggleTaskCompletion(task.task_id, !task.is_completed);
      await this.loadTasks();
      const status = !task.is_completed ? 'completed' : 'pending';
      toast.success(`Task marked as ${status}!`);
    } catch (error) {
      toast.error('Failed to update task');
      console.error(error);
    }
  }

  showTaskDetail(task: WeekdayTask) {
    this.taskDetailData.set(task);
    this.isTaskDetailOpen.set(true);
  }

  closeTaskDetail() {
    this.isTaskDetailOpen.set(false);
    this.taskDetailData.set(null);
  }

  showDeleteConfirmation(taskId: string) {
    this.taskToDelete.set(taskId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.taskToDelete.set(null);
  }

  async confirmDelete() {
    const taskId = this.taskToDelete();
    if (!taskId) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.weekdayTaskService.deleteTask(taskId);
      await this.loadTasks();
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error(error);
    } finally {
      this.isLoading.set(false);
      this.isDeleteConfirmOpen.set(false);
      this.taskToDelete.set(null);
    }
  }

  deleteTask(taskId: string) {
    this.showDeleteConfirmation(taskId);
  }

  getWeekdayName(weekdayId: number): string {
    const day = this.weekdays.find((d) => d.weekday_id === weekdayId);
    return day?.day_name || '';
  }
}
