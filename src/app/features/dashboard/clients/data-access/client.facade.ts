import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest } from '../../../../core/data-access/pagination.model';
import { Client, ClientPayload } from './client.model';
import { CLIENT_REPOSITORY } from './client.repository';

@Injectable({ providedIn: 'root' })
export class ClientFacade {
  private readonly repository = inject(CLIENT_REPOSITORY);

  readonly clients = signal<Client[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);

  load(request: PageRequest = { page: 1, pageSize: 10 }) {
    this.loading.set(true);
    return this.repository.list(request).pipe(
      tap({
        next: ({ items, totalRecords }) => {
          this.clients.set(items);
          this.totalRecords.set(totalRecords);
        },
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: ClientPayload) {
    return this.repository.create(payload);
  }

  update(id: EntityId, payload: ClientPayload) {
    return this.repository.update(id, payload);
  }

  remove(id: EntityId) {
    return this.repository.remove(id);
  }
}
