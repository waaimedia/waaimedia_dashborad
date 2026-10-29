import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);
  private countdownTimer: number | null = null;
  private resetToken: string | null = null;

  protected readonly step = signal<1 | 2 | 3>(1);
  protected readonly submitting = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly resendCooldown = signal(0);
  protected readonly otpExpiresIn = signal(0);
  protected readonly emailForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly otpForm = this.formBuilder.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });
  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });
  protected readonly email = computed(() => this.emailForm.controls.email.value);

  protected sendOtp(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    if (this.resendCooldown() > 0 || this.submitting()) return;

    this.submitting.set(true);
    this.auth.forgotPassword(this.email()).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.resetToken = null;
        this.otpForm.reset();
        this.step.set(2);
        this.startCountdowns();
        this.messages.add({ severity: 'success', summary: 'OTP sent', detail: response.message, life: 3500 });
      },
    });
  }

  protected verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    if (this.otpExpiresIn() === 0 || this.submitting()) {
      this.messages.add({ severity: 'error', summary: 'Code expired', detail: 'Request a new verification code and try again.', life: 3500 });
      return;
    }

    this.submitting.set(true);
    this.auth.verifyOtp(this.email(), this.otpForm.controls.otp.value).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.resetToken = response.reset_token;
        this.stopCountdown();
        this.step.set(3);
        this.messages.add({ severity: 'success', summary: 'Code verified', detail: response.message, life: 3500 });
      },
    });
  }

  protected resetPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    if (this.passwordForm.controls.password.value !== this.passwordForm.controls.confirmPassword.value) {
      this.passwordForm.controls.confirmPassword.setErrors({ mismatch: true });
      this.messages.add({ severity: 'error', summary: 'Passwords do not match', detail: 'Enter the same password in both fields.', life: 3500 });
      return;
    }
    if (!this.resetToken || this.submitting()) {
      this.goTo(1);
      return;
    }

    this.submitting.set(true);
    const { password, confirmPassword } = this.passwordForm.getRawValue();
    this.auth.resetPassword(this.email(), this.resetToken, password, confirmPassword).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: (response) => {
        this.messages.add({ severity: 'success', summary: 'Password reset', detail: response.message, life: 3500 });
        void this.router.navigate(['/auth/login'], { queryParams: { reset: 'success' } });
      },
    });
  }

  protected goTo(step: 1 | 2 | 3): void {
    if (step === 1) {
      this.stopCountdown();
      this.resetToken = null;
    }
    this.step.set(step);
  }

  ngOnDestroy(): void { this.stopCountdown(); }

  private startCountdowns(): void {
    this.stopCountdown();
    this.resendCooldown.set(30);
    this.otpExpiresIn.set(90);
    this.countdownTimer = window.setInterval(() => {
      this.resendCooldown.update((seconds) => Math.max(0, seconds - 1));
      this.otpExpiresIn.update((seconds) => Math.max(0, seconds - 1));
      if (this.otpExpiresIn() === 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimer !== null) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
