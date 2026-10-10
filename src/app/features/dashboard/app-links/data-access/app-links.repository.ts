import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLinks } from './app-links.model';

export interface AppLinksRepository {
  get(): Observable<AppLinks>;
  save(appLinks: AppLinks): Observable<AppLinks>;
}

export const APP_LINKS_REPOSITORY = new InjectionToken<AppLinksRepository>('APP_LINKS_REPOSITORY');
