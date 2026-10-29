import { EntityId } from '../../../../core/data-access/crud-repository';

export interface Client {
  id: EntityId;
  fullName: string;
  logoUrl?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ClientPayload {
  fullName: string;
  logo?: File;
}
