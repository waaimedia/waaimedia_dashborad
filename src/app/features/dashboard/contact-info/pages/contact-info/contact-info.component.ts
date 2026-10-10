import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { ContactInfoFacade } from '../../data-access/contact-info.facade';
import { ContactInfo } from '../../data-access/contact-info.model';

const URL_PATTERN = /^https?:\/\/.+/i;

@Component({
  selector: 'app-contact-info',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-info.component.html',
  styleUrl: './contact-info.component.scss',
})
export class ContactInfoComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(ContactInfoFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);

  protected readonly form = this.formBuilder.nonNullable.group({
    phonePrimary: ['', Validators.maxLength(40)],
    phoneSecondary: ['', Validators.maxLength(40)],
    phoneThird: ['', Validators.maxLength(40)],
    officialEmail: ['', Validators.email],
    facebook: ['', Validators.pattern(URL_PATTERN)],
    instagram: ['', Validators.pattern(URL_PATTERN)],
    youtube: ['', Validators.pattern(URL_PATTERN)],
    linkedin: ['', Validators.pattern(URL_PATTERN)],
    tiktok: ['', Validators.pattern(URL_PATTERN)],
    whatsapp: ['', Validators.pattern(URL_PATTERN)],
    address: ['', Validators.maxLength(500)],
    googleMapsUrl: ['', Validators.pattern(URL_PATTERN)],
  });

  ngOnInit(): void {
    this.header.showContactInfo();
    this.facade.load().subscribe((contactInfo) => this.form.patchValue(contactInfo));
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messages.add({
        severity: 'warn',
        summary: 'Check contact details',
        detail: 'Enter a valid email address and valid URLs beginning with http:// or https://.',
        life: 4000,
      });
      return;
    }

    this.facade.save(this.form.getRawValue() as ContactInfo).subscribe(() => {
      this.messages.add({
        severity: 'success',
        summary: 'Contact information saved',
        detail: 'Your website contact details have been updated.',
        life: 3500,
      });
      this.form.markAsPristine();
    });
  }

  protected cancel(): void {
    const contactInfo = this.facade.contactInfo();
    if (contactInfo) {
      this.form.reset(contactInfo);
    }
  }
}
