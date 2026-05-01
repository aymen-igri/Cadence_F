import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHlmSidebarConfig } from '@spartan-ng/helm/sidebar';
import { authInterceptor } from '@app/core/interceptors/auth.interceptor';
import { errorInterceptor } from '@app/core/interceptors/error.interceptor';
import { loadingInterceptor } from '@app/core/interceptors/loading.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHlmSidebarConfig({
      sidebarWidth: '16rem',
      sidebarWidthMobile: '18rem',
      sidebarWidthIcon: '3rem',
      sidebarCookieName: 'sidebar_state',
      sidebarCookieMaxAge: 60 * 60 * 24 * 7,
      sidebarKeyboardShortcut: 'b',
      mobileBreakpoint: '768px',
    }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
  ],
};
