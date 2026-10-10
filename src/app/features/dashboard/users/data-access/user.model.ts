import { EntityId } from '../../../../core/data-access/crud-repository';

export interface DashboardUser {
  id: EntityId;
  name: string;
  email: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
}
