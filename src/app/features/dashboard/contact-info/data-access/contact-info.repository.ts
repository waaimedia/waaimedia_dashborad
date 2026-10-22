import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactInfo } from './contact-info.model';

export interface ContactInfoRepository {
  get(): Observable<ContactInfo | null>;
  save(contactInfo: ContactInfo): Observable<ContactInfoSaveResult>;
}

export interface ContactInfoSaveResult {
  message: string;
  contactInfo: ContactInfo;
}

export const CONTACT_INFO_REPOSITORY = new InjectionToken<ContactInfoRepository>('CONTACT_INFO_REPOSITORY');
