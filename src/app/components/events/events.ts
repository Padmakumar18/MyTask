import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsService } from '../../services/core/events.service';
import { Event } from '../../models/event.model';
import { UserService } from '../../services/user.service';
import { toast } from 'ngx-sonner';

interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-events',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit {
  private events = signal<Event[]>([]);
  private currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  calendarDays = signal<CalendarDay[]>([]);
  isAddingEvent = signal(false);
  isEditingEvent = signal(false);
  selectedEvent = signal<Event | null>(null);
  eventToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);
  isEventDetailOpen = signal(false);
  eventDetailData = signal<Event | null>(null);

  eventForm: FormGroup;

  private fb = inject(FormBuilder);
  private eventsService = inject(EventsService);
  private userService = inject(UserService);

  // Computed properties
  currentMonthYear = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  selectedDateEvents = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return [];

    const dateString = this.formatDate(selectedDate);
    return this.events()
      .filter((event) => event.event_date === dateString)
      .sort((a, b) => a.event_time.localeCompare(b.event_time));
  });

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor() {
    this.eventForm = this.fb.group({
      event_name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      event_date: ['', Validators.required],
      event_time: ['', Validators.required],
    });
  }

  async ngOnInit() {
    const userId = this.userService.getUserId();
    if (userId) {
      console.log('Events - User ID loaded:', userId);
      await this.loadEvents();
      this.generateCalendar();
    } else {
      console.warn('Events - No user found');
      toast.warning('Please log in to view your events');
    }
  }

  async loadEvents() {
    const userId = this.userService.getUserId();
    if (!userId) return;

    this.isLoading.set(true);
    try {
      const events = await this.eventsService.getEvents(userId);
      this.events.set(events);
      this.generateCalendar();
    } catch (error) {
      toast.error('Failed to load events');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  generateCalendar() {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 42 days (6 weeks) for consistent calendar grid
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      currentDay.setHours(0, 0, 0, 0);

      const dateString = this.formatDate(currentDay);
      const dayEvents = this.events().filter((event) => event.event_date === dateString);

      days.push({
        date: currentDay,
        dateString,
        dayNumber: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.getTime() === today.getTime(),
        events: dayEvents,
      });
    }

    this.calendarDays.set(days);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(time: string): string {
    // Convert 24-hour time to 12-hour AM/PM format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  previousMonth() {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(date);
    this.generateCalendar();
  }

  nextMonth() {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(date);
    this.generateCalendar();
  }

  goToToday() {
    this.currentDate.set(new Date());
    this.generateCalendar();
  }

  selectDate(day: CalendarDay) {
    this.selectedDate.set(day.date);
  }

  showAddEventForm(day?: CalendarDay) {
    this.isAddingEvent.set(true);
    this.isEditingEvent.set(false);
    this.selectedEvent.set(null);
    this.eventForm.reset();

    if (day) {
      this.eventForm.patchValue({ event_date: day.dateString });
      this.selectedDate.set(day.date);
    } else if (this.selectedDate()) {
      this.eventForm.patchValue({ event_date: this.formatDate(this.selectedDate()!) });
    }
  }

  cancelEventForm() {
    this.isAddingEvent.set(false);
    this.isEditingEvent.set(false);
    this.selectedEvent.set(null);
    this.eventForm.reset();
  }

  async addEvent() {
    const userId = this.userService.getUserId();

    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.eventForm.value;
      await this.eventsService.addEvent(userId, {
        event_name: formValue.event_name.trim(),
        description: formValue.description?.trim() || undefined,
        event_date: formValue.event_date,
        event_time: formValue.event_time,
      });

      await this.loadEvents();
      this.isAddingEvent.set(false);
      this.eventForm.reset();
      toast.success('Event added successfully!');
    } catch (error) {
      toast.error('Failed to add event');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEditEventForm(event: Event) {
    this.selectedEvent.set(event);
    this.isEditingEvent.set(true);
    this.isAddingEvent.set(true);
    this.eventForm.patchValue({
      event_name: event.event_name,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time,
    });
  }

  async updateEvent() {
    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const eventId = this.selectedEvent()?.id;
    if (!eventId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.eventForm.value;
      await this.eventsService.updateEvent(eventId, {
        event_name: formValue.event_name.trim(),
        description: formValue.description?.trim() || undefined,
        event_date: formValue.event_date,
        event_time: formValue.event_time,
      });

      await this.loadEvents();
      this.isAddingEvent.set(false);
      this.isEditingEvent.set(false);
      this.selectedEvent.set(null);
      this.eventForm.reset();
      toast.success('Event updated successfully!');
    } catch (error) {
      toast.error('Failed to update event');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showEventDetail(event: Event) {
    this.eventDetailData.set(event);
    this.isEventDetailOpen.set(true);
  }

  closeEventDetail() {
    this.isEventDetailOpen.set(false);
    this.eventDetailData.set(null);
  }

  showDeleteConfirmation(eventId: string) {
    this.eventToDelete.set(eventId);
    this.isDeleteConfirmOpen.set(true);
  }

  cancelDelete() {
    this.isDeleteConfirmOpen.set(false);
    this.eventToDelete.set(null);
  }

  async confirmDelete() {
    const eventId = this.eventToDelete();
    if (!eventId) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      toast.error('User not logged in. Please log in first.');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.eventsService.deleteEvent(eventId);
      await this.loadEvents();
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete event');
      console.error(error);
    } finally {
      this.isLoading.set(false);
      this.isDeleteConfirmOpen.set(false);
      this.eventToDelete.set(null);
    }
  }

  deleteEvent(eventId: string) {
    this.showDeleteConfirmation(eventId);
  }
}
