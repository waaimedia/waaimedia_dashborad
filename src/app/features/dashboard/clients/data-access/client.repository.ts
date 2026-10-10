import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { Client, ClientPayload } from './client.model';

export const CLIENT_REPOSITORY = new InjectionToken<CrudRepository<Client, ClientPayload>>(
  'CLIENT_REPOSITORY',
);
