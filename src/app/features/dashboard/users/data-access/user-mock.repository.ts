import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { DashboardUser, UserPayload } from './user.model';

interface StoredUser extends DashboardUser { password: string; }

@Injectable({ providedIn: 'root' })
export class UserMockRepository implements CrudRepository<DashboardUser, UserPayload> {
  private users: StoredUser[] = [
    { id: 1, name: 'Admin User', email: 'admin@waaimedia.com', password: 'Admin123!' },
    { id: 2, name: 'Maya Hassan', email: 'maya@waaimedia.com', password: 'Maya123!' },
  ];

  list(): Observable<DashboardUser[]> { return of(this.users.map(({ password, ...user }) => user)); }
  getById(id: EntityId): Observable<DashboardUser> {
    const user = this.users.find((item) => item.id === id);
    return user ? of(this.publicUser(user)) : throwError(() => new Error('User not found.'));
  }
  create(payload: UserPayload): Observable<DashboardUser> {
    if (!payload.password) return throwError(() => new Error('Password is required.'));
    if (this.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) return throwError(() => new Error('Email address already exists.'));
    const user: StoredUser = { id: Date.now(), name: payload.name, email: payload.email, password: payload.password };
    this.users = [user, ...this.users];
    return of(this.publicUser(user));
  }
  update(id: EntityId, payload: UserPayload): Observable<DashboardUser> {
    const index = this.users.findIndex((item) => item.id === id);
    if (index < 0) return throwError(() => new Error('User not found.'));
    if (this.users.some((user) => user.id !== id && user.email.toLowerCase() === payload.email.toLowerCase())) return throwError(() => new Error('Email address already exists.'));
    const current = this.users[index];
    const user: StoredUser = { ...current, name: payload.name, email: payload.email, ...(payload.password ? { password: payload.password } : {}) };
    this.users = this.users.map((item) => item.id === id ? user : item);
    return of(this.publicUser(user));
  }
  remove(id: EntityId): Observable<void> { this.users = this.users.filter((user) => user.id !== id); return of(void 0); }
  private publicUser({ password, ...user }: StoredUser): DashboardUser { return user; }
}
