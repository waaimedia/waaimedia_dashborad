import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactInfo } from './contact-info.model';

export interface ContactInfoRepository {
  get(): Observable<ContactInfo>;
  save(contactInfo: ContactInfo): Observable<ContactInfo>;
}

export const CONTACT_INFO_REPOSITORY = new InjectionToken<ContactInfoRepository>('CONTACT_INFO_REPOSITORY');
