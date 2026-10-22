import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ContactInfo } from './contact-info.model';
import { ContactInfoRepository, ContactInfoSaveResult } from './contact-info.repository';

interface ApiContactInfo {
  phone_1: string;
  phone_2: string | null;
  phone_3: string | null;
  official_email: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
  whatsapp: string;
  complete_address: string;
  google_maps_url: string;
}

interface ContactInfoResponse {
  data: ApiContactInfo | null;
}

interface UpdateContactInfoResponse extends ContactInfoResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactInfoApiRepository implements ContactInfoRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/contact-info`;

  get(): Observable<ContactInfo | null> {
    return this.http.get<ContactInfoResponse>(this.url).pipe(
      map(({ data }) => (data ? this.toContactInfo(data) : null)),
    );
  }

  save(contactInfo: ContactInfo): Observable<ContactInfoSaveResult> {
    return this.http.put<UpdateContactInfoResponse>(this.url, this.toPayload(contactInfo)).pipe(
      map(({ message, data }) => ({
        message,
        contactInfo: this.toContactInfo(data),
      })),
    );
  }

  private toContactInfo(contactInfo: ApiContactInfo): ContactInfo {
    return {
      phonePrimary: contactInfo.phone_1,
      phoneSecondary: contactInfo.phone_2 ?? '',
      phoneThird: contactInfo.phone_3 ?? '',
      officialEmail: contactInfo.official_email,
      facebook: contactInfo.facebook,
      instagram: contactInfo.instagram,
      youtube: contactInfo.youtube,
      linkedin: contactInfo.linkedin,
      tiktok: contactInfo.tiktok,
      whatsapp: contactInfo.whatsapp,
      address: contactInfo.complete_address,
      googleMapsUrl: contactInfo.google_maps_url,
    };
  }

  private toPayload(contactInfo: ContactInfo): ApiContactInfo {
    return {
      phone_1: contactInfo.phonePrimary.trim(),
      phone_2: this.optionalPhone(contactInfo.phoneSecondary),
      phone_3: this.optionalPhone(contactInfo.phoneThird),
      official_email: contactInfo.officialEmail.trim(),
      facebook: contactInfo.facebook.trim(),
      instagram: contactInfo.instagram.trim(),
      youtube: contactInfo.youtube.trim(),
      linkedin: contactInfo.linkedin.trim(),
      tiktok: contactInfo.tiktok.trim(),
      whatsapp: contactInfo.whatsapp.trim(),
      complete_address: contactInfo.address.trim(),
      google_maps_url: contactInfo.googleMapsUrl.trim(),
    };
  }

  private optionalPhone(phone: string): string | null {
    const value = phone.trim();
    return value || null;
  }
}
