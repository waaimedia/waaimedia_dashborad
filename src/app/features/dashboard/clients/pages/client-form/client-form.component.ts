import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { ClientFacade } from '../../data-access/client.facade';
import { ClientPayload } from '../../data-access/client.model';

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly facade = inject(ClientFacade);

  private clientId: number | string | null = null;
  protected readonly isEditMode = signal(false);
  protected readonly logoPreview = signal('');
  protected readonly logoName = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);
    this.isEditMode.set(isEditing);
    this.header.showClientForm(isEditing);

    if (id !== null && Number.isFinite(id)) {
      this.loadClient(id);
    }
  }

  protected selectLogo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.messages.add({
        severity: 'warn',
        summary: 'Invalid client logo',
        detail: 'Use a PNG, JPG, or WEBP image up to 5MB.',
        life: 3500,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(String(reader.result));
    reader.readAsDataURL(file);
    this.logoName.set(file.name);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Complete the required fields',
        detail: 'Client name is required.',
        life: 3500,
      });
      return;
    }

    const payload: ClientPayload = {
      ...this.form.getRawValue(),
      logoUrl: this.logoPreview() || undefined,
      logoName: this.logoName() || undefined,
    };
    const request = this.clientId !== null ? this.facade.update(this.clientId, payload) : this.facade.create(payload);

    request.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEditMode() ? 'Client updated' : 'Client added',
          detail: 'The client has been saved successfully.',
          life: 3500,
        });
        this.router.navigateByUrl('/dashboard/clients');
      },
    });
  }

  protected cancel(): void {
    this.router.navigateByUrl('/dashboard/clients');
  }

  private loadClient(id: number): void {
    this.facade.getById(id).subscribe({
      next: (client) => {
        this.clientId = client.id;
        this.form.patchValue({ fullName: client.fullName });
        this.logoPreview.set(client.logoUrl ?? '');
        this.logoName.set(client.logoName ?? '');
      },
      error: () => this.router.navigateByUrl('/dashboard/clients'),
    });
  }
}
