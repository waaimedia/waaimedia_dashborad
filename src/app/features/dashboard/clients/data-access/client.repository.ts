import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest, PageResult } from '../../../../core/data-access/pagination.model';
import { Client, ClientPayload } from './client.model';

export interface ClientRepository {
  list(request: PageRequest): Observable<PageResult<Client>>;
  getById(id: EntityId): Observable<Client>;
  create(payload: ClientPayload): Observable<Client>;
  update(id: EntityId, payload: ClientPayload): Observable<Client>;
  remove(id: EntityId): Observable<void>;
}

export const CLIENT_REPOSITORY = new InjectionToken<ClientRepository>('CLIENT_REPOSITORY');
