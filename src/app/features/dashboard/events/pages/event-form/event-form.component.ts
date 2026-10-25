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
  private coverImage?: File;
  protected readonly isEditMode = signal(false);
  protected readonly imageName = signal('');
  protected readonly imagePreviewUrl = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nameEn: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/[A-Za-z]/)]],
    nameAr: ['', Validators.maxLength(255)],
    categoryEn: ['', Validators.maxLength(150)],
    categoryAr: ['', Validators.maxLength(150)],
    descriptionEn: [''],
    descriptionAr: [''],
    placeEn: ['', Validators.maxLength(255)],
    placeAr: ['', Validators.maxLength(255)],
    eventDate: [''],
    eventTime: [''],
    url: ['', Validators.pattern(/^https?:\/\/.+/i)],
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

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      this.messages.add({ severity: 'warn', summary: 'Invalid image', detail: 'Use a PNG, JPG, or WEBP image up to 10MB.', life: 3500 });
      return;
    }

    this.coverImage = file;
    this.imageName.set(file.name);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }

  protected save(status: EventStatus): void {
    if (this.form.controls.nameEn.invalid) {
      this.form.controls.nameEn.markAsTouched();
      this.messages.add({ severity: 'warn', summary: 'Event title is required', detail: 'Enter an English event title containing Latin characters before saving.', life: 3500 });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({ severity: 'warn', summary: 'Check the links', detail: 'Any link you provide must begin with http:// or https://.', life: 3500 });
      return;
    }

    if (status === 'published' && !this.isPublishReady()) {
      this.messages.add({
        severity: 'warn',
        summary: 'Complete the event before publishing',
        detail: 'Arabic and English content, date, time, venue, category, description, and a cover image are required.',
        life: 5000,
      });
      return;
    }

    const payload: CalendarEventPayload = { ...this.form.getRawValue(), coverImage: this.coverImage };
    const request = this.eventId !== null
      ? this.facade.update(this.eventId, payload, status)
      : this.facade.create(payload, status);

    request.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'Event updated' : 'Event created', detail: status === 'published' ? 'Your event has been published.' : 'Your event was saved as a draft.', life: 3500 });
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
        this.form.patchValue({
          nameEn: event.nameEn,
          nameAr: event.nameAr,
          categoryEn: event.categoryEn,
          categoryAr: event.categoryAr,
          descriptionEn: event.descriptionEn,
          descriptionAr: event.descriptionAr,
          placeEn: event.placeEn,
          placeAr: event.placeAr,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          url: event.url,
        });
        this.imageName.set(event.coverImageUrl ? 'Current cover image' : '');
        this.imagePreviewUrl.set(event.coverImageUrl);
      },
      error: () => this.router.navigateByUrl('/dashboard/events-calendar'),
    });
  }

  private isPublishReady(): boolean {
    const value = this.form.getRawValue();
    return [
      value.nameEn,
      value.nameAr,
      value.categoryEn,
      value.categoryAr,
      value.descriptionEn,
      value.descriptionAr,
      value.placeEn,
      value.placeAr,
      value.eventDate,
      value.eventTime,
    ].every((field) => field.trim().length > 0) && Boolean(this.coverImage || this.imagePreviewUrl());
  }
}
