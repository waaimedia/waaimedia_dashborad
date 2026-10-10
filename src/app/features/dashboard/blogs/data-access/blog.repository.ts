import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { BlogPost, BlogPostPayload } from './blog.model';

export const BLOG_REPOSITORY = new InjectionToken<CrudRepository<BlogPost, BlogPostPayload>>('BLOG_REPOSITORY');
