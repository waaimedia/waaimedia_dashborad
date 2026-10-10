import { Injectable, signal } from '@angular/core';

export type ArticleStatus = 'Published' | 'Draft';

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  status: ArticleStatus;
  linkOne?: string;
  linkTwo?: string;
  content?: string;
  imageName?: string;
}

export type NewsArticleInput = Omit<NewsArticle, 'id' | 'excerpt' | 'status'>;

@Injectable({ providedIn: 'root' })
export class NewsStore {
  readonly articles = signal<NewsArticle[]>([
    {
      id: 1,
      title: 'Breaking: New Technology Trends in 2024',
      excerpt: 'Latest insights on emerging technologies...',
      category: 'Technology',
      status: 'Published',
      content: 'Latest insights on emerging technologies.',
    },
    {
      id: 2,
      title: 'Digital Marketing Strategies for Small Business',
      excerpt: 'Comprehensive guide to digital marketing...',
      category: 'Marketing',
      status: 'Draft',
      content: 'Comprehensive guide to digital marketing.',
    },
    {
      id: 3,
      title: 'The Future of Remote Work',
      excerpt: 'Exploring trends in remote work culture...',
      category: 'Business',
      status: 'Published',
      content: 'Exploring trends in remote work culture.',
    },
    {
      id: 1,
      title: 'Breaking: New Technology Trends in 2024',
      excerpt: 'Latest insights on emerging technologies...',
      category: 'Technology',
      status: 'Published',
      content: 'Latest insights on emerging technologies.',
    },
    {
      id: 2,
      title: 'Digital Marketing Strategies for Small Business',
      excerpt: 'Comprehensive guide to digital marketing...',
      category: 'Marketing',
      status: 'Draft',
      content: 'Comprehensive guide to digital marketing.',
    },
    {
      id: 3,
      title: 'The Future of Remote Work',
      excerpt: 'Exploring trends in remote work culture...',
      category: 'Business',
      status: 'Published',
      content: 'Exploring trends in remote work culture.',
    },
    {
      id: 1,
      title: 'Breaking: New Technology Trends in 2024',
      excerpt: 'Latest insights on emerging technologies...',
      category: 'Technology',
      status: 'Published',
      content: 'Latest insights on emerging technologies.',
    },
    {
      id: 2,
      title: 'Digital Marketing Strategies for Small Business',
      excerpt: 'Comprehensive guide to digital marketing...',
      category: 'Marketing',
      status: 'Draft',
      content: 'Comprehensive guide to digital marketing.',
    },
    {
      id: 3,
      title: 'The Future of Remote Work',
      excerpt: 'Exploring trends in remote work culture...',
      category: 'Business',
      status: 'Published',
      content: 'Exploring trends in remote work culture.',
    },
    {
      id: 1,
      title: 'Breaking: New Technology Trends in 2024',
      excerpt: 'Latest insights on emerging technologies...',
      category: 'Technology',
      status: 'Published',
      content: 'Latest insights on emerging technologies.',
    },
    {
      id: 2,
      title: 'Digital Marketing Strategies for Small Business',
      excerpt: 'Comprehensive guide to digital marketing...',
      category: 'Marketing',
      status: 'Draft',
      content: 'Comprehensive guide to digital marketing.',
    },
    {
      id: 4,
      title: 'The Future of Remote Work',
      excerpt: 'Exploring trends in remote work culture...',
      category: 'Business',
      status: 'Published',
      content: 'Exploring trends in remote work culture.',
    },
  ]);

  getById(id: number): NewsArticle | undefined {
    return this.articles().find((article) => article.id === id);
  }

  create(input: NewsArticleInput, status: ArticleStatus): void {
    const article: NewsArticle = {
      ...input,
      id: Date.now(),
      status,
      excerpt: input.content ? `${input.content.slice(0, 52)}...` : 'No content preview available.',
    };
    this.articles.update((articles) => [article, ...articles]);
  }

  update(id: number, input: NewsArticleInput, status: ArticleStatus): void {
    this.articles.update((articles) =>
      articles.map((article) =>
        article.id === id
          ? {
              ...article,
              ...input,
              status,
              excerpt: input.content ? `${input.content.slice(0, 52)}...` : article.excerpt,
            }
          : article,
      ),
    );
  }

  remove(id: number): void {
    this.articles.update((articles) => articles.filter((article) => article.id !== id));
  }
}
