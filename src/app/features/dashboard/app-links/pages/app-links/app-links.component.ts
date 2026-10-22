import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { AppLinksFacade } from '../../data-access/app-links.facade';
import { AppLinks, EMPTY_APP_LINKS } from '../../data-access/app-links.model';

const URL_PATTERN = /^https?:\/\/.+/i;

@Component({
  selector: 'app-app-links',
  imports: [ReactiveFormsModule],
  templateUrl: './app-links.component.html',
  styleUrl: './app-links.component.scss',
})
export class AppLinksComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(AppLinksFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);

  protected readonly form = this.formBuilder.nonNullable.group({
    googlePlay: ['', [Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    appleAppStore: ['', [Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
    otherPlatform: ['', [Validators.maxLength(500), Validators.pattern(URL_PATTERN)]],
  });
  protected readonly loading = this.facade.loading;
  protected readonly saving = this.facade.saving;
  protected readonly fieldErrors = signal<Partial<Record<keyof AppLinks, string>>>({});

  ngOnInit(): void {
    this.header.showAppLinks();
    this.facade.load().subscribe({
      next: (links) => this.form.reset(links ?? EMPTY_APP_LINKS),
      error: () => undefined,
    });
  }

  protected save(): void {
    this.clearServerErrors();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Check your links',
        detail: 'Enter valid links beginning with http:// or https://.',
        life: 4000,
      });
      return;
    }

    this.facade.save(this.form.getRawValue()).subscribe({
      next: ({ message }) => {
        this.messages.add({
          severity: 'success',
          summary: 'App links saved',
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
    this.form.reset(this.facade.links() ?? EMPTY_APP_LINKS);
  }

  protected errorFor(field: keyof AppLinks): string | null {
    return this.form.controls[field].touched ? this.fieldErrors()[field] ?? null : null;
  }

  private applyServerValidationErrors(error: unknown): void {
    if (!(error instanceof HttpErrorResponse) || error.status !== 422 || !this.isValidationError(error.error)) {
      return;
    }

    const fieldMap: Record<string, keyof AppLinks> = {
      google_app_link: 'googlePlay',
      apple_app_store_link: 'appleAppStore',
      app_gallery_link: 'otherPlatform',
    };
    const mappedErrors: Partial<Record<keyof AppLinks, string>> = {};

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
