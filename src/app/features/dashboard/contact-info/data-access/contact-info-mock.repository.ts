import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContactInfo } from './contact-info.model';
import { ContactInfoRepository } from './contact-info.repository';

@Injectable({ providedIn: 'root' })
export class ContactInfoMockRepository implements ContactInfoRepository {
  private contactInfo: ContactInfo = {
    phonePrimary: '+20 10 24940180',
    phoneSecondary: '+20 10 03450774',
    phoneThird: '+20 10 29105073',
    officialEmail: 'company@gmail.com',
    facebook: 'https://facebook.com/company',
    instagram: 'https://instagram.com/company',
    youtube: 'https://youtube.com/company',
    linkedin: 'https://linkedin.com/company',
    tiktok: 'https://tiktok.com/company',
    whatsapp: 'https://wa.me/201024940180',
    address: 'World Trade Center, Downtown Cairo',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!',
  };

  get(): Observable<ContactInfo> {
    return of({ ...this.contactInfo });
  }

  save(contactInfo: ContactInfo): Observable<ContactInfo> {
    this.contactInfo = { ...contactInfo };
    return of({ ...this.contactInfo });
  }
}
