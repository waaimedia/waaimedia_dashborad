import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { Client, ClientPayload } from './client.model';
import { CLIENT_REPOSITORY } from './client.repository';

@Injectable({ providedIn: 'root' })
export class ClientFacade {
  private readonly repository = inject(CLIENT_REPOSITORY);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.list().pipe(
      tap({
        next: (clients) => this.clients.set(clients),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: ClientPayload) {
    return this.repository.create(payload).pipe(tap(() => this.load().subscribe()));
  }

  update(id: EntityId, payload: ClientPayload) {
    return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe()));
  }

  remove(id: EntityId) {
    return this.repository.remove(id).pipe(tap(() => this.load().subscribe()));
  }
}
