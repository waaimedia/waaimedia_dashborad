import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  imports: [RouterOutlet, Toast, ConfirmDialog],
  selector: 'app-root',
  styleUrl: './app.scss',
  template: `
    <p-toast position="top-right" [breakpoints]="toastBreakpoints" />
    <p-confirmDialog [breakpoints]="confirmDialogBreakpoints" />
    <router-outlet />
  `,
})
export class App {
  protected readonly toastBreakpoints = {
    '640px': { width: 'calc(100vw - 1.5rem)', right: '0.75rem', left: '0.75rem' },
  };
  protected readonly confirmDialogBreakpoints = {
    '640px': 'calc(100vw - 1.5rem)',
  };
}
