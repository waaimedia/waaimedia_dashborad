import { EntityId } from '../../../../core/data-access/crud-repository';

export type ArticleStatus = 'Published' | 'Draft';

export const NEWS_CATEGORIES = [
  'Health',
  'Food',
  'Fashion & Beauty',
  'Travel',
  'Economy',
  'Sports',
  'Entertainment',
  'Podcast',
  'Events',
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const ENTERTAINMENT_SUBCATEGORIES = [
  'Celebrities',
  'In Theaters',
  'TV Shows',
  'Book Reviews',
] as const;

export interface NewsArticle {
  id: EntityId;
  title?: string;
  arabicTitle?: string;
  description?: string;
  arabicDescription?: string;
  authorName?: string;
  arabicAuthorName?: string;
  excerpt: string;
  category?: string;
  subcategory?: string;
  isArabic?: boolean;
  status: ArticleStatus;
  linkOne?: string;
  linkTwo?: string;
  content?: string;
  arabicContent?: string;
  imageName?: string;
}

export interface NewsArticlePayload {
  title?: string;
  arabicTitle?: string;
  description?: string;
  arabicDescription?: string;
  authorName?: string;
  arabicAuthorName?: string;
  category?: string;
  subcategory?: string;
  isArabic?: boolean;
  status: ArticleStatus;
  linkOne?: string;
  linkTwo?: string;
  content?: string;
  arabicContent?: string;
  imageName?: string;
}
