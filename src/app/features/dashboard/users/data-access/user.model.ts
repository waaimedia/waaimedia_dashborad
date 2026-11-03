import { EntityId } from '../../../../core/data-access/crud-repository';
import { UserRole } from '../../../../core/auth/auth.service';

export type AssignableUserRole = Exclude<UserRole, 'super_admin'>;
export type UserCreateRole = AssignableUserRole;

export interface DashboardUser {
  id: EntityId;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfilePayload {
  name: string;
  email: string;
}

export interface UserCreatePayload extends UserProfilePayload {
  password: string;
  role: UserCreateRole;
}
