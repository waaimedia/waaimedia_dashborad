import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest, PageResult } from '../../../../core/data-access/pagination.model';
import { TeamMember, TeamMemberPayload } from './team.model';

export interface TeamRepository {
  list(request: PageRequest): Observable<PageResult<TeamMember>>;
  getById(id: EntityId): Observable<TeamMember>;
  create(payload: TeamMemberPayload): Observable<TeamMember>;
  update(id: EntityId, payload: TeamMemberPayload): Observable<TeamMember>;
  remove(id: EntityId): Observable<void>;
}

export const TEAM_REPOSITORY = new InjectionToken<TeamRepository>('TEAM_REPOSITORY');
