import { Injectable } from '@angular/core';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { Observable, of, throwError } from 'rxjs';
import { TeamMember, TeamMemberPayload } from './team.model';

@Injectable({ providedIn: 'root' })
export class TeamMockRepository implements CrudRepository<TeamMember, TeamMemberPayload> {
  private members: TeamMember[] = [
    { id: 1, fullName: 'Sarah Johnson', role: 'Product Manager', photoUrl: 'https://i.pravatar.cc/160?img=47' },
    { id: 2, fullName: 'Michael Chen', role: 'Senior Developer', photoUrl: 'https://i.pravatar.cc/160?img=12' },
    { id: 3, fullName: 'Emily Rodriguez', role: 'UX Designer', photoUrl: 'https://i.pravatar.cc/160?img=45' },
    { id: 4, fullName: 'David Kim', role: 'Marketing Lead', photoUrl: 'https://i.pravatar.cc/160?img=14' },
    { id: 5, fullName: 'Olivia Martin', role: 'Content Strategist', photoUrl: 'https://i.pravatar.cc/160?img=32' },
    { id: 6, fullName: 'James Wilson', role: 'Account Manager', photoUrl: 'https://i.pravatar.cc/160?img=11' },
    { id: 7, fullName: 'Nora Ali', role: 'Social Media Specialist', photoUrl: 'https://i.pravatar.cc/160?img=44' },
    { id: 8, fullName: 'Adam Hassan', role: 'Creative Director', photoUrl: 'https://i.pravatar.cc/160?img=13' },
  ];

  list(): Observable<TeamMember[]> {
    return of([...this.members]);
  }

  getById(id: EntityId): Observable<TeamMember> {
    const member = this.members.find((item) => item.id === id);
    return member ? of(member) : throwError(() => new Error('Team member not found.'));
  }

  create(payload: TeamMemberPayload): Observable<TeamMember> {
    const member: TeamMember = { ...payload, id: Date.now() };
    this.members = [member, ...this.members];
    return of(member);
  }

  update(id: EntityId, payload: TeamMemberPayload): Observable<TeamMember> {
    const index = this.members.findIndex((item) => item.id === id);
    if (index < 0) {
      return throwError(() => new Error('Team member not found.'));
    }

    const member = { ...this.members[index], ...payload };
    this.members = this.members.map((item) => (item.id === id ? member : item));
    return of(member);
  }

  remove(id: EntityId): Observable<void> {
    this.members = this.members.filter((member) => member.id !== id);
    return of(void 0);
  }
}
