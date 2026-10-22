import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppLinks } from './app-links.model';
import { AppLinksRepository, AppLinksSaveResult } from './app-links.repository';

@Injectable({ providedIn: 'root' })
export class AppLinksMockRepository implements AppLinksRepository {
  private links: AppLinks = {
    googlePlay: '',
    appleAppStore: '',
    otherPlatform: '',
  };

  get(): Observable<AppLinks | null> {
    return of({ ...this.links });
  }

  save(appLinks: AppLinks): Observable<AppLinksSaveResult> {
    this.links = { ...appLinks };
    return of({ message: 'App download links updated successfully.', links: { ...this.links } });
  }
}
