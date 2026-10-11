import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { PortfolioFacade } from '../../data-access/portfolio.facade';
import { PortfolioItemPayload, PortfolioStatus } from '../../data-access/portfolio.model';

@Component({
  selector: 'app-portfolio-form',
  imports: [ReactiveFormsModule, Select],
  templateUrl: './portfolio-form.component.html',
  styleUrl: './portfolio-form.component.scss',
})
export class PortfolioFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly portfolioFacade = inject(PortfolioFacade);

  private itemId: number | string | null = null;
  protected readonly isEditMode = signal(false);
  protected readonly imageName = signal('');
  protected readonly categories = [
    { label: 'Web Development', value: 'Web Development' },
    { label: 'Branding', value: 'Branding' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Design', value: 'Design' },
  ];
  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(180)]],
    category: ['', Validators.required],
    linkOne: ['', Validators.pattern(/^https?:\/\/.+/i)],
    linkTwo: ['', Validators.pattern(/^https?:\/\/.+/i)],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);

    this.isEditMode.set(isEditing);
    if (isEditing && id !== null) {
      this.loadItem(id);
    }

    this.header.showPortfolioForm(isEditing);
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

  protected save(status: PortfolioStatus): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Complete the required fields',
        detail: 'Project title and category are required before saving.',
        life: 3500,
      });
      return;
    }

    const payload: PortfolioItemPayload = { ...this.form.getRawValue(), imageName: this.imageName(), status };
    const request = this.itemId !== null
      ? this.portfolioFacade.update(this.itemId, payload)
      : this.portfolioFacade.create(payload);

    request.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEditMode() ? 'Portfolio item updated' : 'Portfolio item created',
          detail: status === 'Published' ? 'Your portfolio item has been published.' : 'Your portfolio item was saved as a draft.',
          life: 3500,
        });
        this.router.navigateByUrl('/dashboard/portfolio');
      },
    });
  }

  protected cancel(): void {
    this.router.navigateByUrl('/dashboard/portfolio');
  }

  private loadItem(id: number): void {
    this.portfolioFacade.getById(id).subscribe({
      next: (item) => {
        this.itemId = item.id;
        this.imageName.set(item.imageName ?? '');
        this.form.patchValue({ title: item.title, category: item.category, linkOne: item.linkOne ?? '', linkTwo: item.linkTwo ?? '' });
      },
      error: () => this.router.navigateByUrl('/dashboard/portfolio'),
    });
  }
}
