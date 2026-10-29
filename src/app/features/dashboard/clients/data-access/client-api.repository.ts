import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest, PageResult } from '../../../../core/data-access/pagination.model';
import { Client, ClientPayload } from './client.model';
import { ClientRepository } from './client.repository';

interface ApiClient {
  id: number;
  name: string;
  logo_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ApiResourceResponse {
  data: ApiClient;
}

interface ApiListResponse {
  data: ApiClient[];
  meta: { total: number };
}

@Injectable({ providedIn: 'root' })
export class ClientApiRepository implements ClientRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/clients`;

  list(request: PageRequest): Observable<PageResult<Client>> {
    return this.http
      .get<ApiListResponse>(this.url, { params: { page: request.page, per_page: request.pageSize } })
      .pipe(
        map(({ data, meta }) => ({
          items: data.map((client) => this.toClient(client)),
          totalRecords: meta.total,
        })),
      );
  }

  getById(id: EntityId): Observable<Client> {
    return this.http.get<ApiResourceResponse>(`${this.url}/${id}`).pipe(map(({ data }) => this.toClient(data)));
  }

  create(payload: ClientPayload): Observable<Client> {
    return this.http
      .post<ApiResourceResponse>(this.url, this.toCreateRequestBody(payload))
      .pipe(map(({ data }) => this.toClient(data)));
  }

  update(id: EntityId, payload: ClientPayload): Observable<Client> {
    if (!payload.logo) {
      return this.http
        .patch<ApiResourceResponse>(`${this.url}/${id}`, { name: payload.fullName.trim() })
        .pipe(map(({ data }) => this.toClient(data)));
    }

    const body = new FormData();
    body.append('_method', 'PATCH');
    body.append('name', payload.fullName.trim());
    body.append('logo', payload.logo, payload.logo.name);
    return this.http
      .post<ApiResourceResponse>(`${this.url}/${id}`, body)
      .pipe(map(({ data }) => this.toClient(data)));
  }

  remove(id: EntityId): Observable<void> {
    return this.http.delete(`${this.url}/${id}`).pipe(map(() => void 0));
  }

  private toCreateRequestBody(payload: ClientPayload): FormData {
    const body = new FormData();
    body.append('name', payload.fullName.trim());
    if (payload.logo) {
      body.append('logo', payload.logo, payload.logo.name);
    }
    return body;
  }

  private toClient(client: ApiClient): Client {
    return {
      id: client.id,
      fullName: client.name,
      logoUrl: client.logo_url ?? undefined,
      createdAt: client.created_at ?? null,
      updatedAt: client.updated_at ?? null,
    };
  }
}
