import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ContactInfo } from './contact-info.model';
import { CONTACT_INFO_REPOSITORY } from './contact-info.repository';

@Injectable({ providedIn: 'root' })
export class ContactInfoFacade {
  private readonly repository = inject(CONTACT_INFO_REPOSITORY);

  readonly contactInfo = signal<ContactInfo | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.get().pipe(
      tap({
        next: (contactInfo) => this.contactInfo.set(contactInfo),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  save(contactInfo: ContactInfo) {
    this.saving.set(true);
    return this.repository.save(contactInfo).pipe(
      tap({
        next: ({ contactInfo: savedContactInfo }) => this.contactInfo.set(savedContactInfo),
        finalize: () => this.saving.set(false),
      }),
    );
  }
}
