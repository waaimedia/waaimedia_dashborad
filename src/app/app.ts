import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { LoadingService } from './core/http/loading.service';

@Component({
  imports: [RouterOutlet, Toast, ConfirmDialog],
  selector: 'app-root',
  styleUrl: './app.scss',
  template: `
    <p-toast position="top-right" [breakpoints]="toastBreakpoints" />
    <p-confirmDialog [breakpoints]="confirmDialogBreakpoints" />
    @if (loading.isLoading()) {
      <div class="app-loader" role="status" aria-live="polite" aria-label="Loading">
        <div class="app-loader__card">
          <span class="app-loader__spinner" aria-hidden="true"></span>
          <span>Loading</span>
        </div>
      </div>
    }
    <router-outlet />
  `,
})
export class App {
  protected readonly loading = inject(LoadingService);
  protected readonly toastBreakpoints = {
    '640px': { width: 'calc(100vw - 1.5rem)', right: '0.75rem', left: '0.75rem' },
  };
  protected readonly confirmDialogBreakpoints = {
    '640px': 'calc(100vw - 1.5rem)',
  };
}
