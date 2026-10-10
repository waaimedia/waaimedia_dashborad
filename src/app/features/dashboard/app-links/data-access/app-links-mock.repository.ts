import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppLinks } from './app-links.model';
import { AppLinksRepository } from './app-links.repository';

@Injectable({ providedIn: 'root' })
export class AppLinksMockRepository implements AppLinksRepository {
  private links: AppLinks = {
    googlePlay: '',
    appleAppStore: '',
    otherPlatform: '',
  };

  get(): Observable<AppLinks> {
    return of({ ...this.links });
  }

  save(appLinks: AppLinks): Observable<AppLinks> {
    this.links = { ...appLinks };
    return of({ ...this.links });
  }
}
