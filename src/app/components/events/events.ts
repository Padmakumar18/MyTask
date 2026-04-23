import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsService } from '../../services/core/events.service';
import { Event } from '../../models/event.model';
import { toast } from 'ngx-sonner';

interface CalendarDay {
  date: Date;
  dateString: string;
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
  events = signal<Event[]>([]);
  currentDate = signal(new Date());
  selectedDate = signal<string | null>(null);
  calendarDays = signal<CalendarDay[]>([]);

  isAddingEvent = signal(false);
  isEditingEvent = signal(false);
  selectedEvent = signal<Event | null>(null);
  eventToDelete = signal<string | null>(null);
  isDeleteConfirmOpen = signal(false);
  isLoading = signal(false);

  eventForm: FormGroup;
  userId: string | null = null;

  currentMonthYear = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  selectedDateEvents = computed(() => {
    const selectedDate = this.selectedDate();
    if (!selectedDate) return [];
    return this.events().filter((event) => event.event_date === selectedDate);
  });

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      event_date: ['', Validators.required],
    });
  }

  async ngOnInit() {
    // Get userId from localStorage or your auth service
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData.user_id;
      await this.loadEvents();
      this.generateCalendar();
    }
  }

  async loadEvents() {
    if (!this.userId) return;

    this.isLoading.set(true);
    try {
      const events = await this.eventsService.getEvents(this.userId);
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
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);

      const dateString = this.formatDate(currentDay);
      const dayEvents = this.events().filter((event) => event.event_date === dateString);

      days.push({
        date: currentDay,
        dateString,
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

  previousMonth() {
    const date = this.currentDate();
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(new Date(date));
    this.generateCalendar();
  }

  nextMonth() {
    const date = this.currentDate();
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(new Date(date));
    this.generateCalendar();
  }

  selectDate(dateString: string) {
    this.selectedDate.set(dateString);
  }

  showAddEventForm(dateString?: string) {
    this.isAddingEvent.set(true);
    this.isEditingEvent.set(false);
    this.selectedEvent.set(null);
    this.eventForm.reset();

    if (dateString) {
      this.eventForm.patchValue({ event_date: dateString });
    } else if (this.selectedDate()) {
      this.eventForm.patchValue({ event_date: this.selectedDate() });
    }
  }

  cancelEventForm() {
    this.isAddingEvent.set(false);
    this.isEditingEvent.set(false);
    this.selectedEvent.set(null);
    this.eventForm.reset();
  }

  async addEvent() {
    if (this.eventForm.invalid || !this.userId) {
      this.eventForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.eventForm.value;
      await this.eventsService.addEvent(this.userId, {
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
        event_date: formValue.event_date,
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
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
    });
  }

  async updateEvent() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const eventId = this.selectedEvent()?.event_id;
    if (!eventId) return;

    this.isLoading.set(true);
    try {
      const formValue = this.eventForm.value;
      await this.eventsService.updateEvent(eventId, {
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
        event_date: formValue.event_date,
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
