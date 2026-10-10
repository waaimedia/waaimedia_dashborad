import { EntityId } from '../../../../core/data-access/crud-repository';

export type ArticleStatus = 'Published' | 'Draft';

export interface NewsArticle {
  id: EntityId;
  title: string;
  excerpt: string;
  category: string;
  status: ArticleStatus;
  linkOne?: string;
  linkTwo?: string;
  content?: string;
  imageName?: string;
}

export interface NewsArticlePayload {
  title: string;
  category: string;
  status: ArticleStatus;
  linkOne?: string;
  linkTwo?: string;
  content: string;
  imageName?: string;
}
