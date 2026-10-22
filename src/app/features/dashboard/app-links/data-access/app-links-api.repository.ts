import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AppLinks } from './app-links.model';
import { AppLinksRepository, AppLinksSaveResult } from './app-links.repository';

interface ApiAppLinks {
  google_app_link: string | null;
  apple_app_store_link: string | null;
  app_gallery_link: string | null;
}

interface AppLinksResponse {
  data: ApiAppLinks | null;
}

interface UpdateAppLinksResponse extends AppLinksResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AppLinksApiRepository implements AppLinksRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/app-links`;

  get(): Observable<AppLinks | null> {
    return this.http.get<AppLinksResponse>(this.url).pipe(
      map(({ data }) => (data ? this.toAppLinks(data) : null)),
    );
  }

  save(links: AppLinks): Observable<AppLinksSaveResult> {
    return this.http.put<UpdateAppLinksResponse>(this.url, this.toPayload(links)).pipe(
      map(({ message, data }) => ({ message, links: this.toAppLinks(data) })),
    );
  }

  private toAppLinks(links: ApiAppLinks): AppLinks {
    return {
      googlePlay: links.google_app_link ?? '',
      appleAppStore: links.apple_app_store_link ?? '',
      otherPlatform: links.app_gallery_link ?? '',
    };
  }

  private toPayload(links: AppLinks): ApiAppLinks {
    return {
      google_app_link: this.optionalLink(links.googlePlay),
      apple_app_store_link: this.optionalLink(links.appleAppStore),
      app_gallery_link: this.optionalLink(links.otherPlatform),
    };
  }

  private optionalLink(link: string): string | null {
    const value = link.trim();
    return value || null;
  }
}
