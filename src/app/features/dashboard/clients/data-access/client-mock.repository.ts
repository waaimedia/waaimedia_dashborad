import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { Client, ClientPayload } from './client.model';

@Injectable({ providedIn: 'root' })
export class ClientMockRepository implements CrudRepository<Client, ClientPayload> {
  private clients: Client[] = [
    { id: 1, fullName: 'Horizon Group', logoUrl: 'https://i.pravatar.cc/160?img=47' },
    { id: 2, fullName: 'Vertex Solutions', logoUrl: 'https://i.pravatar.cc/160?img=12' },
    { id: 3, fullName: 'Northstar Studio', logoUrl: 'https://i.pravatar.cc/160?img=45' },
    { id: 4, fullName: 'Apex Partners', logoUrl: 'https://i.pravatar.cc/160?img=14' },
  ];

  list(): Observable<Client[]> {
    return of([...this.clients]);
  }

  getById(id: EntityId): Observable<Client> {
    const client = this.clients.find((item) => item.id === id);
    return client ? of(client) : throwError(() => new Error('Client not found.'));
  }

  create(payload: ClientPayload): Observable<Client> {
    const client: Client = { ...payload, id: Date.now() };
    this.clients = [client, ...this.clients];
    return of(client);
  }

  update(id: EntityId, payload: ClientPayload): Observable<Client> {
    const index = this.clients.findIndex((item) => item.id === id);
    if (index < 0) {
      return throwError(() => new Error('Client not found.'));
    }

    const client = { ...this.clients[index], ...payload };
    this.clients = this.clients.map((item) => (item.id === id ? client : item));
    return of(client);
  }

  remove(id: EntityId): Observable<void> {
    this.clients = this.clients.filter((client) => client.id !== id);
    return of(void 0);
  }
}
