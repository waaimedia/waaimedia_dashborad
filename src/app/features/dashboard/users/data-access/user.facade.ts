import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { AssignableUserRole, DashboardUser, UserCreatePayload, UserProfilePayload } from './user.model';
import { UserListRequest, USER_REPOSITORY } from './user.repository';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly repository = inject(USER_REPOSITORY);
  readonly users = signal<DashboardUser[]>([]);
  readonly totalRecords = signal(0);

  load(request: UserListRequest = { page: 1, pageSize: 15 }) {
    return this.repository.list(request).pipe(
      tap(({ items, totalRecords }) => {
        this.users.set(items);
        this.totalRecords.set(totalRecords);
      }),
    );
  }

  getById(id: EntityId) { return this.repository.getById(id); }
  create(payload: UserCreatePayload) { return this.repository.create(payload); }
  update(id: EntityId, payload: UserProfilePayload) { return this.repository.update(id, payload); }
  changeRole(id: EntityId, role: AssignableUserRole) { return this.repository.changeRole(id, role); }
  resetPassword(id: EntityId, password: string, passwordConfirmation: string) {
    return this.repository.resetPassword(id, password, passwordConfirmation);
  }
  remove(id: EntityId) { return this.repository.remove(id); }
}
