import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { httpErrorInterceptor } from './core/http/http-error.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { NewsMockRepository } from './features/dashboard/news/data-access/news-mock.repository';
import { NEWS_REPOSITORY } from './features/dashboard/news/data-access/news.repository';
import { TeamMockRepository } from './features/dashboard/team/data-access/team-mock.repository';
import { TEAM_REPOSITORY } from './features/dashboard/team/data-access/team.repository';
import { CountersApiRepository } from './features/dashboard/counters/data-access/counters-api.repository';
import { COUNTERS_REPOSITORY } from './features/dashboard/counters/data-access/counters.repository';
import { ClientMockRepository } from './features/dashboard/clients/data-access/client-mock.repository';
import { CLIENT_REPOSITORY } from './features/dashboard/clients/data-access/client.repository';
import { EventApiRepository } from './features/dashboard/events/data-access/event-api.repository';
import { EVENT_REPOSITORY } from './features/dashboard/events/data-access/event.repository';
import { ContactInfoApiRepository } from './features/dashboard/contact-info/data-access/contact-info-api.repository';
import { CONTACT_INFO_REPOSITORY } from './features/dashboard/contact-info/data-access/contact-info.repository';
import { AppLinksApiRepository } from './features/dashboard/app-links/data-access/app-links-api.repository';
import { APP_LINKS_REPOSITORY } from './features/dashboard/app-links/data-access/app-links.repository';
import { BlogMockRepository } from './features/dashboard/blogs/data-access/blog-mock.repository';
import { BLOG_REPOSITORY } from './features/dashboard/blogs/data-access/blog.repository';
import { UserMockRepository } from './features/dashboard/users/data-access/user-mock.repository';
import { USER_REPOSITORY } from './features/dashboard/users/data-access/user.repository';
import { BackgroundMusicMockRepository } from './features/dashboard/background-music/data-access/background-music-mock.repository';
import { BACKGROUND_MUSIC_REPOSITORY } from './features/dashboard/background-music/data-access/background-music.repository';
import { PortfolioMockRepository } from './features/dashboard/portfolio/data-access/portfolio-mock.repository';
import { PORTFOLIO_REPOSITORY } from './features/dashboard/portfolio/data-access/portfolio.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, httpErrorInterceptor])),
    MessageService,
    ConfirmationService,
    // Replace NewsMockRepository with the API implementation when endpoints are ready.
    { provide: NEWS_REPOSITORY, useExisting: NewsMockRepository },
    // Replace TeamMockRepository with the API implementation when endpoints are ready.
    { provide: TEAM_REPOSITORY, useExisting: TeamMockRepository },
    { provide: COUNTERS_REPOSITORY, useExisting: CountersApiRepository },
    // Replace ClientMockRepository with the API implementation when endpoints are ready.
    { provide: CLIENT_REPOSITORY, useExisting: ClientMockRepository },
    { provide: EVENT_REPOSITORY, useExisting: EventApiRepository },
    { provide: CONTACT_INFO_REPOSITORY, useExisting: ContactInfoApiRepository },
    { provide: APP_LINKS_REPOSITORY, useExisting: AppLinksApiRepository },
    // Replace BlogMockRepository with the API implementation when endpoints are ready.
    { provide: BLOG_REPOSITORY, useExisting: BlogMockRepository },
    // Replace UserMockRepository with the API implementation when endpoints are ready.
    { provide: USER_REPOSITORY, useExisting: UserMockRepository },
    // Replace BackgroundMusicMockRepository with the API implementation when endpoints are ready.
    { provide: BACKGROUND_MUSIC_REPOSITORY, useExisting: BackgroundMusicMockRepository },
    // Replace PortfolioMockRepository with the API implementation when endpoints are ready.
    { provide: PORTFOLIO_REPOSITORY, useExisting: PortfolioMockRepository },
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
};
