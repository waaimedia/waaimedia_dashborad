import { EntityId } from '../../../../core/data-access/crud-repository';

export interface Client {
  id: EntityId;
  fullName: string;
  logoUrl?: string;
  logoName?: string;
}

export interface ClientPayload {
  fullName: string;
  logoUrl?: string;
  logoName?: string;
}
