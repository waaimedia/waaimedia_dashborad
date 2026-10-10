import { Injectable, inject, signal } from '@angular/core';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { tap } from 'rxjs';
import { TeamMember, TeamMemberPayload } from './team.model';
import { TEAM_REPOSITORY } from './team.repository';

@Injectable({ providedIn: 'root' })
export class TeamFacade {
  private readonly repository = inject(TEAM_REPOSITORY);

  readonly members = signal<TeamMember[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.list().pipe(
      tap({
        next: (members) => this.members.set(members),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: TeamMemberPayload) {
    return this.repository.create(payload).pipe(tap(() => this.load().subscribe()));
  }

  update(id: EntityId, payload: TeamMemberPayload) {
    return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe()));
  }

  remove(id: EntityId) {
    return this.repository.remove(id).pipe(tap(() => this.load().subscribe()));
  }
}
