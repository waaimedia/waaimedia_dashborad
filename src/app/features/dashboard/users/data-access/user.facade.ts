import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { DashboardUser, UserPayload } from './user.model';
import { USER_REPOSITORY } from './user.repository';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly repository = inject(USER_REPOSITORY);
  readonly users = signal<DashboardUser[]>([]);
  load() { return this.repository.list().pipe(tap((users) => this.users.set(users))); }
  getById(id: EntityId) { return this.repository.getById(id); }
  create(payload: UserPayload) { return this.repository.create(payload).pipe(tap(() => this.load().subscribe())); }
  update(id: EntityId, payload: UserPayload) { return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe())); }
  remove(id: EntityId) { return this.repository.remove(id).pipe(tap(() => this.load().subscribe())); }
}
