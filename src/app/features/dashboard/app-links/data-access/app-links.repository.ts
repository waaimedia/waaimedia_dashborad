import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLinks } from './app-links.model';

export interface AppLinksRepository {
  get(): Observable<AppLinks | null>;
  save(appLinks: AppLinks): Observable<AppLinksSaveResult>;
}

export interface AppLinksSaveResult {
  message: string;
  links: AppLinks;
}

export const APP_LINKS_REPOSITORY = new InjectionToken<AppLinksRepository>('APP_LINKS_REPOSITORY');
