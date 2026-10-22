import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { ContactInfoFacade } from '../../data-access/contact-info.facade';
import { ContactInfo, EMPTY_CONTACT_INFO } from '../../data-access/contact-info.model';

const URL_PATTERN = /^https?:\/\/.+/i;
const PHONE_PATTERN = /^(\+?[0-9\s\-().]+)$/;

@Component({
  selector: 'app-contact-info',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.scss',
})
export class ContactInfoComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(ContactInfoFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);

  protected readonly form = this.formBuilder.nonNullable.group({
    phonePrimary: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(PHONE_PATTERN)]],
    phoneSecondary: ['', [Validators.minLength(5), Validators.maxLength(50), Validators.pattern(PHONE_PATTERN)]],
    phoneThird: ['', [Validators.minLength(5), Validators.maxLength(50), Validators.pattern(PHONE_PATTERN)]],
    officialEmail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    facebook: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    instagram: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    youtube: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    linkedin: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    tiktok: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    whatsapp: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    address: ['', [Validators.required, Validators.maxLength(2000)]],
    googleMapsUrl: ['', [Validators.required, Validators.maxLength(2000), Validators.pattern(URL_PATTERN)]],
  });
  protected readonly loading = this.facade.loading;
  protected readonly saving = this.facade.saving;
  protected readonly fieldErrors = signal<Partial<Record<keyof ContactInfo, string>>>({});

  ngOnInit(): void {
    this.header.showContactInfo();
    this.facade.load().subscribe({
      next: (contactInfo) => this.form.reset(contactInfo ?? EMPTY_CONTACT_INFO),
      error: () => undefined,
    });
  }

  protected save(): void {
    this.clearServerErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Check contact details',
        detail: 'Enter a valid email address and valid URLs beginning with http:// or https://.',
        life: 4000,
      });
      return;
    }

    this.facade.save(this.form.getRawValue()).subscribe({
      next: ({ message }) => {
        this.messages.add({
          severity: 'success',
          summary: 'Contact information saved',
          detail: message,
          life: 3500,
        });
        this.form.markAsPristine();
      },
      error: (error: unknown) => this.applyServerValidationErrors(error),
    });
  }

  protected cancel(): void {
    this.clearServerErrors();
    this.form.reset(this.facade.contactInfo() ?? EMPTY_CONTACT_INFO);
  }

  protected errorFor(field: keyof ContactInfo): string | null {
    return this.form.controls[field].touched ? this.fieldErrors()[field] ?? null : null;
  }

  private applyServerValidationErrors(error: unknown): void {
    if (!(error instanceof HttpErrorResponse) || error.status !== 422 || !this.isValidationError(error.error)) {
      return;
    }

    const fieldMap: Record<string, keyof ContactInfo> = {
      phone_1: 'phonePrimary',
      phone_2: 'phoneSecondary',
      phone_3: 'phoneThird',
      official_email: 'officialEmail',
      facebook: 'facebook',
      instagram: 'instagram',
      youtube: 'youtube',
      linkedin: 'linkedin',
      tiktok: 'tiktok',
      whatsapp: 'whatsapp',
      complete_address: 'address',
      google_maps_url: 'googleMapsUrl',
    };
    const mappedErrors: Partial<Record<keyof ContactInfo, string>> = {};

    for (const [apiField, messages] of Object.entries(error.error.errors)) {
      const field = fieldMap[apiField];
      const message = messages[0];
      if (!field || typeof message !== 'string') {
        continue;
      }

      mappedErrors[field] = message;
      const control = this.form.controls[field];
      control.setErrors({ ...(control.errors ?? {}), server: message });
    }

    this.fieldErrors.set(mappedErrors);
    this.form.markAllAsTouched();
  }

  private clearServerErrors(): void {
    this.fieldErrors.set({});
    for (const control of Object.values(this.form.controls)) {
      if (!control.errors?.['server']) {
        continue;
      }

      const { server: _server, ...clientErrors } = control.errors;
      control.setErrors(Object.keys(clientErrors).length ? clientErrors : null);
    }
  }

  private isValidationError(error: unknown): error is { errors: Record<string, string[]> } {
    return !!error && typeof error === 'object' && 'errors' in error && typeof error.errors === 'object';
  }
}
