import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { NewsArticle, NewsArticlePayload } from './news.model';

export const NEWS_REPOSITORY = new InjectionToken<CrudRepository<NewsArticle, NewsArticlePayload>>(
  'NEWS_REPOSITORY',
);
