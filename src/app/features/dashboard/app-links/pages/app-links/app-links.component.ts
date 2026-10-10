import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { AppLinksFacade } from '../../data-access/app-links.facade';
import { AppLinks } from '../../data-access/app-links.model';

const URL_PATTERN = /^https?:\/\/.+/i;

@Component({
  selector: 'app-app-links',
  imports: [ReactiveFormsModule],
  templateUrl: './app-links.component.html',
  styleUrl: './app-links.component.scss',
})
export class AppLinksComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(AppLinksFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);

  protected readonly form = this.formBuilder.nonNullable.group({
    googlePlay: ['', Validators.pattern(URL_PATTERN)],
    appleAppStore: ['', Validators.pattern(URL_PATTERN)],
    otherPlatform: ['', Validators.pattern(URL_PATTERN)],
  });

  ngOnInit(): void {
    this.header.showAppLinks();
    this.facade.load().subscribe((links) => this.form.patchValue(links));
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Check your links',
        detail: 'Enter valid links beginning with http:// or https://.',
        life: 4000,
      });
      return;
    }

    this.facade.save(this.form.getRawValue() as AppLinks).subscribe(() => {
      this.messages.add({
        severity: 'success',
        summary: 'App links saved',
        detail: 'Your application download links have been updated.',
        life: 3500,
      });
      this.form.markAsPristine();
    });
  }

  protected cancel(): void {
    const links = this.facade.links();
    if (links) {
      this.form.reset(links);
    }
  }
}
