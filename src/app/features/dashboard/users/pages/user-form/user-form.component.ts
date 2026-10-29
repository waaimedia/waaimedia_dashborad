import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { UserFacade } from '../../data-access/user.facade';
import { AssignableUserRole, UserCreatePayload } from '../../data-access/user.model';

@Component({ selector: 'app-user-form', imports: [ReactiveFormsModule], templateUrl: './user-form.component.html', styleUrl: './user-form.component.scss' })
export class UserFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly messages = inject(MessageService); private readonly header = inject(DashboardHeaderService); private readonly facade = inject(UserFacade); private readonly auth = inject(AuthService);
  private userId: number | string | null = null;
  private originalRole: AssignableUserRole | 'super_admin' | null = null;
  protected readonly isEditMode = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly canAssignRole = () => this.auth.hasRole('super_admin') && this.originalRole !== 'super_admin';
  protected readonly roleOptions: { label: string; value: AssignableUserRole }[] = [{ label: 'Editor', value: 'editor' }, { label: 'Admin', value: 'admin' }];
  protected readonly form = this.formBuilder.nonNullable.group({ name: ['', [Validators.required, Validators.maxLength(255)]], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]], role: ['editor' as AssignableUserRole, Validators.required] });
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id'); const id = idParam === null ? null : Number(idParam); const editing = id !== null && Number.isFinite(id); this.isEditMode.set(editing);
    if (editing) { this.form.controls.password.clearValidators(); this.form.controls.password.updateValueAndValidity(); this.loadUser(id); }
    this.header.showUserForm(editing);
  }
  protected save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.messages.add({ severity: 'warn', summary: 'Complete the required fields', detail: this.isEditMode() ? 'Enter a valid name and email address.' : 'Name, email, and a password of at least 8 characters are required.', life: 4000 }); return; }
    const values = this.form.getRawValue(); const role = this.auth.hasRole('super_admin') ? values.role : 'editor';
    const request = this.userId !== null ? this.facade.update(this.userId, { name: values.name, email: values.email }).pipe(switchMap((user) => this.canAssignRole() && this.originalRole !== role ? this.facade.changeRole(user.id, role) : [user])) : this.facade.create({ name: values.name, email: values.email, password: values.password, role } satisfies UserCreatePayload);
    request.subscribe({ next: () => { this.messages.add({ severity: 'success', summary: this.isEditMode() ? 'User updated' : 'User added', detail: 'The user has been saved successfully.', life: 3500 }); void this.router.navigateByUrl('/dashboard/users'); } });
  }
  protected cancel(): void { void this.router.navigateByUrl('/dashboard/users'); }
  private loadUser(id: number): void {
    this.facade.getById(id).subscribe({
      next: (user) => {
        if (!this.auth.canManageUser(user.role)) {
          void this.router.navigateByUrl('/dashboard/users');
          return;
        }

        this.userId = user.id;
        this.originalRole = user.role;
        this.form.patchValue({ name: user.name, email: user.email, role: user.role === 'super_admin' ? 'editor' : user.role });
      },
      error: () => void this.router.navigateByUrl('/dashboard/users'),
    });
  }
}
