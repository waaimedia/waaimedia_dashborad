import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { EventFacade } from '../../data-access/event.facade';
import { CalendarEventPayload, EventStatus } from '../../data-access/event.model';

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
})
export class EventFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly facade = inject(EventFacade);

  private eventId: number | string | null = null;
  protected readonly isEditMode = signal(false);
  protected readonly imageName = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(180)]],
    date: ['', Validators.required],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    place: ['', [Validators.required, Validators.maxLength(180)]],
    eventLink: ['', Validators.pattern(/^https?:\/\/.+/i)],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);
    this.isEditMode.set(isEditing);
    this.header.showEventForm(isEditing);

    if (id !== null && Number.isFinite(id)) {
      this.loadEvent(id);
    }
  }

  protected selectImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      this.messages.add({ severity: 'warn', summary: 'Invalid image', detail: 'Use a PNG or JPG image up to 10MB.', life: 3500 });
      return;
    }

    this.imageName.set(file.name);
  }

  protected save(status: EventStatus): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({ severity: 'warn', summary: 'Complete the required fields', detail: 'Title, date, category, and place are required before saving.', life: 3500 });
      return;
    }

    const payload: CalendarEventPayload = { ...this.form.getRawValue(), imageName: this.imageName(), status };
    const request = this.eventId !== null ? this.facade.update(this.eventId, payload) : this.facade.create(payload);

    request.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'Event updated' : 'Event created', detail: status === 'Published' ? 'Your event has been published.' : 'Your event was saved as a draft.', life: 3500 });
        this.router.navigateByUrl('/dashboard/events-calendar');
      },
    });
  }

  protected cancel(): void {
    this.router.navigateByUrl('/dashboard/events-calendar');
  }

  private loadEvent(id: number): void {
    this.facade.getById(id).subscribe({
      next: (event) => {
        this.eventId = event.id;
        this.form.patchValue({ title: event.title, date: event.date, category: event.category, place: event.place, eventLink: event.eventLink ?? '' });
        this.imageName.set(event.imageName ?? '');
      },
      error: () => this.router.navigateByUrl('/dashboard/events-calendar'),
    });
  }
}
