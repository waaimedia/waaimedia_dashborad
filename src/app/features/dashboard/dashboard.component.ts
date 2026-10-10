import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <main class="dashboard-placeholder" dir="ltr">
      <div>
        <span>WAAI MEDIA</span>
        <h1>Dashboard is ready for its pages.</h1>
        <p>The authentication foundation is in place. We can add the dashboard details next.</p>
        <button type="button" (click)="logout()">Log out</button>
      </div>
    </main>
  `,
  styles: `
    .dashboard-placeholder { align-items: center; background: var(--waai-surface-muted); display: grid; min-height: 100dvh; padding: 1.5rem; place-items: center; text-align: center; }
    div { background: var(--waai-surface); border-radius: var(--waai-radius-lg); box-shadow: var(--waai-shadow-sm); max-width: 40rem; padding: 3rem; }
    span { color: var(--waai-primary); font-weight: 800; letter-spacing: .08em; }
    h1 { margin: 1rem 0; }
    p { color: var(--waai-text-muted); }
    button { background: var(--waai-primary); border: 0; border-radius: var(--waai-radius-sm); color: #fff; cursor: pointer; font: inherit; font-weight: 700; margin-top: 1rem; padding: .8rem 1.5rem; }
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.clearSession();
    this.router.navigateByUrl('/auth/login');
  }
}
