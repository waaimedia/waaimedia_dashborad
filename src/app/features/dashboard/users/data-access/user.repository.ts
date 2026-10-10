import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { DashboardUser, UserPayload } from './user.model';

export const USER_REPOSITORY = new InjectionToken<CrudRepository<DashboardUser, UserPayload>>('USER_REPOSITORY');
