import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ContactInfo } from './contact-info.model';
import { CONTACT_INFO_REPOSITORY } from './contact-info.repository';

@Injectable({ providedIn: 'root' })
export class ContactInfoFacade {
  private readonly repository = inject(CONTACT_INFO_REPOSITORY);

  readonly contactInfo = signal<ContactInfo | null>(null);

  load() {
    return this.repository.get().pipe(tap((contactInfo) => this.contactInfo.set(contactInfo)));
  }

  save(contactInfo: ContactInfo) {
    return this.repository.save(contactInfo).pipe(tap((savedContactInfo) => this.contactInfo.set(savedContactInfo)));
  }
}
