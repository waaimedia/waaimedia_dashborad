import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { TeamMember, TeamMemberPayload } from './team.model';

export const TEAM_REPOSITORY = new InjectionToken<CrudRepository<TeamMember, TeamMemberPayload>>(
  'TEAM_REPOSITORY',
);
