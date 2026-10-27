import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest, PageResult } from '../../../../core/data-access/pagination.model';
import { TeamMember, TeamMemberPayload } from './team.model';
import { TeamRepository } from './team.repository';

interface ApiTeamMember {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
}

interface ApiResourceResponse {
  data: ApiTeamMember;
}

interface ApiListResponse {
  data: ApiTeamMember[];
  meta: { total: number };
}

@Injectable({ providedIn: 'root' })
export class TeamApiRepository implements TeamRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/team-members`;

  list(request: PageRequest): Observable<PageResult<TeamMember>> {
    return this.http
      .get<ApiListResponse>(this.url, { params: { page: request.page, per_page: request.pageSize } })
      .pipe(map(({ data, meta }) => ({ items: data.map((member) => this.toTeamMember(member)), totalRecords: meta.total })));
  }

  getById(id: EntityId): Observable<TeamMember> {
    return this.http.get<ApiResourceResponse>(`${this.url}/${id}`).pipe(map(({ data }) => this.toTeamMember(data)));
  }

  create(payload: TeamMemberPayload): Observable<TeamMember> {
    return this.http.post<ApiResourceResponse>(this.url, this.toRequestBody(payload)).pipe(map(({ data }) => this.toTeamMember(data)));
  }

  update(id: EntityId, payload: TeamMemberPayload): Observable<TeamMember> {
    const body = this.toRequestBody(payload);
    if (body instanceof FormData) {
      body.append('_method', 'PATCH');
      return this.http.post<ApiResourceResponse>(`${this.url}/${id}`, body).pipe(map(({ data }) => this.toTeamMember(data)));
    }

    return this.http.patch<ApiResourceResponse>(`${this.url}/${id}`, body).pipe(map(({ data }) => this.toTeamMember(data)));
  }

  remove(id: EntityId): Observable<void> {
    return this.http.delete(`${this.url}/${id}`).pipe(map(() => void 0));
  }

  private toRequestBody(payload: TeamMemberPayload): FormData | { name: string; position: string } {
    const values = { name: payload.fullName.trim(), position: payload.role.trim() };
    if (!payload.photo) return values;

    const body = new FormData();
    body.append('name', values.name);
    body.append('position', values.position);
    body.append('photo', payload.photo);
    return body;
  }

  private toTeamMember(member: ApiTeamMember): TeamMember {
    return {
      id: member.id,
      fullName: member.name,
      role: member.position,
      photoUrl: member.photo_url ?? undefined,
    };
  }
}
