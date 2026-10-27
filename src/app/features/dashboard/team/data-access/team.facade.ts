import { Injectable, inject, signal } from '@angular/core';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest } from '../../../../core/data-access/pagination.model';
import { tap } from 'rxjs';
import { TeamMember, TeamMemberPayload } from './team.model';
import { TEAM_REPOSITORY } from './team.repository';

@Injectable({ providedIn: 'root' })
export class TeamFacade {
  private readonly repository = inject(TEAM_REPOSITORY);

  readonly members = signal<TeamMember[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);

  load(request: PageRequest = { page: 1, pageSize: 10 }) {
    this.loading.set(true);
    return this.repository.list(request).pipe(
      tap({
        next: ({ items, totalRecords }) => {
          this.members.set(items);
          this.totalRecords.set(totalRecords);
        },
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: TeamMemberPayload) {
    return this.repository.create(payload);
  }

  update(id: EntityId, payload: TeamMemberPayload) {
    return this.repository.update(id, payload);
  }

  remove(id: EntityId) {
    return this.repository.remove(id);
  }
}
