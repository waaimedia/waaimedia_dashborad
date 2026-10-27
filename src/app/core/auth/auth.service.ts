import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'waai-media-access-token';
const USER_KEY = 'waai-media-user';

export type UserRole = 'super_admin' | 'admin' | 'editor';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

interface LoginResponse {
  message: string;
  token: string;
  token_type: 'Bearer';
  user: AuthUser;
  session_id: number;
}

interface CurrentUserResponse {
  user: AuthUser;
}

interface MessageResponse {
  message: string;
}

interface VerifyOtpResponse extends MessageResponse {
  reset_token: string;
  expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthUser | null>(this.readStoredUser());

  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }

  /**
   * Determines whether the signed-in user can manage a dashboard user with
   * the supplied role. This policy is intentionally role-based: a
   * super-admin can manage admins and editors, while an admin can manage
   * editors only.
   */
  canManageUser(targetRole: UserRole): boolean {
    const actorRole = this.currentUser()?.role;
    return (
      (actorRole === 'super_admin' && (targetRole === 'admin' || targetRole === 'editor')) ||
      (actorRole === 'admin' && targetRole === 'editor')
    );
  }

  /** Editors can edit content, but deletion is reserved for admins. */
  canDeleteContent(): boolean {
    return this.hasRole('super_admin', 'admin');
  }

  getAccessToken(): string | null {
    return this.getActiveStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/login`, {
        email,
        password,
        // device_name: 'Waai Media Dashboard',
      })
      .pipe(tap((response) => this.startSession(response.token, response.user)));
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${this.authUrl}/me`).pipe(tap(({ user }) => this.updateStoredUser(user)));
  }

  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authUrl}/logout`, {});
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authUrl}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.authUrl}/verify-otp`, { email, otp });
  }

  resetPassword(
    email: string,
    resetToken: string,
    password: string,
    passwordConfirmation: string,
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.authUrl}/reset-password`, {
      email,
      reset_token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private startSession(token: string, user: AuthUser): void {
    this.clearSession();
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private updateStoredUser(user: AuthUser): void {
    const storage = this.getActiveStorage();
    storage?.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getActiveStorage(): Storage | null {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
      return localStorage;
    }

    if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
      return sessionStorage;
    }

    return null;
  }

  private readStoredUser(): AuthUser | null {
    const rawUser = this.getActiveStorage()?.getItem(USER_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      const user: unknown = JSON.parse(rawUser);
      return this.isAuthUser(user) ? user : null;
    } catch {
      return null;
    }
  }

  private isAuthUser(user: unknown): user is AuthUser {
    if (!user || typeof user !== 'object') {
      return false;
    }

    const candidate = user as Partial<AuthUser>;
    return (
      typeof candidate.id === 'number' &&
      typeof candidate.name === 'string' &&
      typeof candidate.email === 'string' &&
      (candidate.role === 'super_admin' || candidate.role === 'admin' || candidate.role === 'editor')
    );
  }
}
