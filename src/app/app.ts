import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  imports: [RouterOutlet, Toast, ConfirmDialog],
  selector: 'app-root',
  styleUrl: './app.scss',
  template: '<p-toast position="top-right" /><p-confirmDialog /><router-outlet />',
})
export class App {}
