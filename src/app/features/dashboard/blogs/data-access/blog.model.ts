import { EntityId } from '../../../../core/data-access/crud-repository';

export type BlogStatus = 'Published' | 'Draft';

export interface BlogPost {
  id: EntityId;
  title: string;
  excerpt: string;
  category: string;
  status: BlogStatus;
  linkOne?: string;
  linkTwo?: string;
  content?: string;
  imageName?: string;
}

export interface BlogPostPayload {
  title: string;
  category: string;
  status: BlogStatus;
  linkOne?: string;
  linkTwo?: string;
  content: string;
  imageName?: string;
}
