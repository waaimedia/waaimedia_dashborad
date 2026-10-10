import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  protected readonly step = signal<1 | 2 | 3>(1);
  protected readonly emailForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly otpForm = this.formBuilder.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });
  protected readonly email = computed(() => this.emailForm.controls.email.value);

  protected sendOtp(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.step.set(2);
    this.messages.add({
      severity: 'success',
      summary: 'OTP sent',
      detail: 'A verification code has been sent to your email address.',
      life: 3500,
    });
  }

  protected verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.step.set(3);
    this.messages.add({
      severity: 'success',
      summary: 'Code verified',
      detail: 'You can now set a new password.',
      life: 3500,
    });
  }

  protected resetPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.controls.password.value !== this.passwordForm.controls.confirmPassword.value) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      this.messages.add({
        severity: 'error',
        summary: 'Passwords do not match',
        detail: 'Enter the same password in both fields.',
        life: 3500,
      });
      return;
    }

    this.messages.add({
      severity: 'success',
      summary: 'Password reset',
      detail: 'Your password has been reset. Please sign in.',
      life: 3500,
    });
    this.router.navigate(['/auth/login'], { queryParams: { reset: 'success' } });
  }

  protected goTo(step: 1 | 2 | 3): void {
    this.step.set(step);
  }
}
