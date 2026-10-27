import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest, PageResult } from '../../../../core/data-access/pagination.model';
import { AssignableUserRole, DashboardUser, UserCreatePayload, UserProfilePayload } from './user.model';

export interface UserListRequest extends PageRequest {
  search?: string;
  role?: DashboardUser['role'];
}

export interface UserRepository {
  list(request: UserListRequest): Observable<PageResult<DashboardUser>>;
  getById(id: EntityId): Observable<DashboardUser>;
  create(payload: UserCreatePayload): Observable<DashboardUser>;
  update(id: EntityId, payload: UserProfilePayload): Observable<DashboardUser>;
  changeRole(id: EntityId, role: AssignableUserRole): Observable<DashboardUser>;
  resetPassword(id: EntityId, password: string, passwordConfirmation: string): Observable<void>;
  remove(id: EntityId): Observable<void>;
}

export const USER_REPOSITORY = new InjectionToken<UserRepository>('USER_REPOSITORY');
