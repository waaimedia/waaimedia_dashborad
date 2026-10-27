import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { TeamFacade } from '../../data-access/team.facade';
import { TeamMemberPayload } from '../../data-access/team.model';

@Component({
  selector: 'app-team-form',
  imports: [ReactiveFormsModule],
  templateUrl: './team-form.component.html',
  styleUrl: './team-form.component.scss',
})
export class TeamFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly facade = inject(TeamFacade);

  private memberId: number | string | null = null;
  protected readonly isEditMode = signal(false);
  protected readonly photoPreview = signal('');
  protected readonly photoName = signal('');
  private readonly photo = signal<File | undefined>(undefined);
  protected readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    role: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? null : Number(idParam);
    const isEditing = id !== null && Number.isFinite(id);
    this.isEditMode.set(isEditing);
    this.header.showTeamForm(isEditing);

    if (id !== null && Number.isFinite(id)) {
      this.loadMember(id);
    }
  }

  protected selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.messages.add({
        severity: 'warn',
        summary: 'Invalid profile photo',
        detail: 'Use a PNG, JPG, or WEBP image up to 5MB.',
        life: 3500,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.photoPreview.set(String(reader.result));
    reader.readAsDataURL(file);
    this.photo.set(file);
    this.photoName.set(file.name);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Complete the required fields',
        detail: 'Full name and position are required.',
        life: 3500,
      });
      return;
    }

    const payload: TeamMemberPayload = {
      ...this.form.getRawValue(),
      photo: this.photo(),
    };
    const request = this.memberId !== null ? this.facade.update(this.memberId, payload) : this.facade.create(payload);

    request.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: this.isEditMode() ? 'Member updated' : 'Member added',
          detail: 'The team member has been saved successfully.',
          life: 3500,
        });
        void this.router.navigateByUrl('/dashboard/team');
      },
    });
  }

  protected cancel(): void {
    void this.router.navigateByUrl('/dashboard/team');
  }

  private loadMember(id: number): void {
    this.facade.getById(id).subscribe({
      next: (member) => {
        this.memberId = member.id;
        this.form.patchValue({ fullName: member.fullName, role: member.role });
        this.photoPreview.set(member.photoUrl ?? '');
        this.photoName.set('');
      },
      error: () => void this.router.navigateByUrl('/dashboard/team'),
    });
  }
}
