import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { AssignableUserRole, DashboardUser, UserCreatePayload, UserProfilePayload } from './user.model';
import { UserListRequest, UserRepository } from './user.repository';

interface StoredUser extends DashboardUser { password: string; }

@Injectable({ providedIn: 'root' })
export class UserMockRepository implements UserRepository {
  private users: StoredUser[] = [
    { id: 1, name: 'Admin User', email: 'admin@waaimedia.com', role: 'admin', password: 'Admin123!' },
    { id: 2, name: 'Maya Hassan', email: 'maya@waaimedia.com', role: 'editor', password: 'Maya123!' },
  ];

  list(_request: UserListRequest): Observable<{ items: DashboardUser[]; totalRecords: number }> {
    const items = this.users.map(({ password, ...user }) => user);
    return of({ items, totalRecords: items.length });
  }
  getById(id: EntityId): Observable<DashboardUser> { const user = this.users.find((item) => item.id === id); return user ? of(this.publicUser(user)) : throwError(() => new Error('User not found.')); }
  create(payload: UserCreatePayload): Observable<DashboardUser> { const user: StoredUser = { id: Date.now(), ...payload }; this.users = [user, ...this.users]; return of(this.publicUser(user)); }
  update(id: EntityId, payload: UserProfilePayload): Observable<DashboardUser> { const user = this.users.find((item) => item.id === id); if (!user) return throwError(() => new Error('User not found.')); Object.assign(user, payload); return of(this.publicUser(user)); }
  changeRole(id: EntityId, role: AssignableUserRole): Observable<DashboardUser> { const user = this.users.find((item) => item.id === id); if (!user) return throwError(() => new Error('User not found.')); user.role = role; return of(this.publicUser(user)); }
  resetPassword(id: EntityId, password: string, _passwordConfirmation: string): Observable<void> { const user = this.users.find((item) => item.id === id); if (!user) return throwError(() => new Error('User not found.')); user.password = password; return of(void 0); }
  remove(id: EntityId): Observable<void> { this.users = this.users.filter((user) => user.id !== id); return of(void 0); }
  private publicUser({ password, ...user }: StoredUser): DashboardUser { return user; }
}
