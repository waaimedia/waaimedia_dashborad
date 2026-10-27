import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { UserRole } from '../../../../core/auth/auth.service';
import { AssignableUserRole, DashboardUser, UserCreatePayload, UserProfilePayload } from './user.model';
import { UserListRequest, UserRepository } from './user.repository';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

interface ApiResourceResponse {
  data: ApiUser;
}

interface ApiListResponse {
  data: ApiUser[];
  meta: { total: number };
}

@Injectable({ providedIn: 'root' })
export class UserApiRepository implements UserRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/users`;

  list(request: UserListRequest): Observable<PageResult<DashboardUser>> {
    const params: Record<string, string | number> = { page: request.page, per_page: request.pageSize };
    if (request.search?.trim()) params['search'] = request.search.trim();
    if (request.role) params['role'] = request.role;

    return this.http
      .get<ApiListResponse>(this.url, { params })
      .pipe(map(({ data, meta }) => ({ items: data.map((user) => this.toUser(user)), totalRecords: meta.total })));
  }

  getById(id: EntityId): Observable<DashboardUser> {
    return this.http.get<ApiResourceResponse>(`${this.url}/${id}`).pipe(map(({ data }) => this.toUser(data)));
  }

  create(payload: UserCreatePayload): Observable<DashboardUser> {
    return this.http.post<ApiResourceResponse>(this.url, payload).pipe(map(({ data }) => this.toUser(data)));
  }

  update(id: EntityId, payload: UserProfilePayload): Observable<DashboardUser> {
    return this.http.patch<ApiResourceResponse>(`${this.url}/${id}`, payload).pipe(map(({ data }) => this.toUser(data)));
  }

  changeRole(id: EntityId, role: AssignableUserRole): Observable<DashboardUser> {
    return this.http.patch<ApiResourceResponse>(`${this.url}/${id}/role`, { role }).pipe(map(({ data }) => this.toUser(data)));
  }

  resetPassword(id: EntityId, password: string, passwordConfirmation: string): Observable<void> {
    return this.http.patch(`${this.url}/${id}/password`, { password, password_confirmation: passwordConfirmation }).pipe(map(() => void 0));
  }

  remove(id: EntityId): Observable<void> {
    return this.http.delete(`${this.url}/${id}`).pipe(map(() => void 0));
  }

  private toUser(user: ApiUser): DashboardUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
