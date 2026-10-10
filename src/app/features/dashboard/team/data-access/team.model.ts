import { EntityId } from '../../../../core/data-access/crud-repository';

export interface TeamMember {
  id: EntityId;
  fullName: string;
  role: string;
  photoUrl?: string;
  photoName?: string;
}

export interface TeamMemberPayload {
  fullName: string;
  role: string;
  photoUrl?: string;
  photoName?: string;
}
