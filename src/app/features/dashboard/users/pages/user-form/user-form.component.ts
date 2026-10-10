import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { UserFacade } from '../../data-access/user.facade';
import { UserPayload } from '../../data-access/user.model';

@Component({ selector: 'app-user-form', imports: [ReactiveFormsModule], templateUrl: './user-form.component.html', styleUrl: './user-form.component.scss' })
export class UserFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly messages = inject(MessageService); private readonly header = inject(DashboardHeaderService); private readonly facade = inject(UserFacade);
  private userId: number | string | null = null;
  protected readonly isEditMode = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({ name: ['', [Validators.required, Validators.maxLength(100)]], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]] });
  ngOnInit(): void { const idParam = this.route.snapshot.paramMap.get('id'); const id = idParam === null ? null : Number(idParam); const editing = id !== null && Number.isFinite(id); this.isEditMode.set(editing); if (editing) { this.form.controls.password.setValidators([Validators.minLength(8)]); this.form.controls.password.updateValueAndValidity(); this.loadUser(id!); } this.header.showUserForm(editing); }
  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.messages.add({ severity: 'warn', summary: 'Complete the required fields', detail: this.isEditMode() ? 'Enter a valid name and email. Password must be at least 8 characters if changed.' : 'Name, email, and a password of at least 8 characters are required.', life: 4000 }); return; }
    const values = this.form.getRawValue(); const payload: UserPayload = { name: values.name, email: values.email, ...(values.password ? { password: values.password } : {}) }; const request = this.userId !== null ? this.facade.update(this.userId, payload) : this.facade.create(payload);
    request.subscribe({ next: () => { this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'User updated' : 'User added', detail: 'The user has been saved successfully.', life: 3500 }); this.router.navigateByUrl('/dashboard/users'); }, error: (error: Error) => this.messages.add({ severity: 'error', summary: 'Unable to save user', detail: error.message || 'Please try again.', life: 4000 }) });
  }
  protected cancel(): void { this.router.navigateByUrl('/dashboard/users'); }
  private loadUser(id: number): void { this.facade.getById(id).subscribe({ next: (user) => { this.userId = user.id; this.form.patchValue({ name: user.name, email: user.email }); }, error: () => this.router.navigateByUrl('/dashboard/users') }); }
}
