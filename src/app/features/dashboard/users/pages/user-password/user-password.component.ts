import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { UserFacade } from '../../data-access/user.facade';

@Component({
  selector: 'app-user-password',
  imports: [ReactiveFormsModule],
  templateUrl: './user-password.component.html',
  styleUrl: './user-password.component.scss',
})
export class UserPasswordComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly facade = inject(UserFacade);
  private readonly auth = inject(AuthService);

  private userId: number | string | null = null;
  protected readonly userName = signal('');
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      void this.router.navigateByUrl('/dashboard/users');
      return;
    }

    this.facade.getById(id).subscribe({
      next: (user) => {
        if (!this.auth.canManageUser(user.role)) {
          void this.router.navigateByUrl('/dashboard/users');
          return;
        }

        this.userId = user.id;
        this.userName.set(user.name);
        this.header.showUserPassword(user.name);
      },
      error: () => void this.router.navigateByUrl('/dashboard/users'),
    });
  }

  protected save(): void {
    if (this.form.invalid || this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Check the password',
        detail: this.form.controls.password.value !== this.form.controls.confirmPassword.value
          ? 'New password and confirmation must match.'
          : 'Password must be at least 8 characters.',
        life: 4000,
      });
      return;
    }

    if (this.userId === null) {
      return;
    }

    this.facade.resetPassword(this.userId, this.form.controls.password.value, this.form.controls.confirmPassword.value).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Password updated', detail: `Password changed for ${this.userName()}.`, life: 3500 });
        void this.router.navigateByUrl('/dashboard/users');
      },
    });
  }

  protected cancel(): void {
    void this.router.navigateByUrl('/dashboard/users');
  }
}
