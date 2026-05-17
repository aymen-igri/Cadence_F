import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideHlmSidebarConfig } from '@spartan-ng/helm/sidebar';
import { authInterceptor } from '@app/core/interceptors/auth.interceptor';
import { errorInterceptor } from '@app/core/interceptors/error.interceptor';
import { loadingInterceptor } from '@app/core/interceptors/loading.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheInterceptor } from '@app/core/interceptors/cache.interceptor';
import { retryInterceptor } from '@app/core/interceptors/retry.interceptor';
import { cancelInterceptor } from '@app/core/interceptors/cancel.interceptor';
import { provideIcons } from '@ng-icons/core';
import {
  lucideServerCrash,
  lucideEye,
  lucideEyeOff,
  lucideBookOpen,
  lucideTriangle,
  lucideMail,
  lucideSmartphone,
  lucideShieldCheck,
  lucideArrowLeft,
  lucideKeyRound,
  lucidePlus,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCalendarOff,
  lucideSparkles,
  lucideInbox,
  lucideMoreVertical,
  lucideAlertTriangle,
  lucideCalendarClock,
  lucideMessageCircle,
  lucideUsers,
  lucideTarget,
  lucideClock,
  lucideCheckCheck,
  lucideAlertCircle,
} from '@ng-icons/lucide';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHlmSidebarConfig({
      sidebarWidth: '16rem',
      sidebarWidthMobile: '18rem',
      sidebarWidthIcon: '3rem',
      sidebarCookieName: 'sidebar_state',
      sidebarCookieMaxAge: 60 * 60 * 24 * 7,
      sidebarKeyboardShortcut: 'b',
      mobileBreakpoint: '768px',
    }),
    provideHttpClient(
      withInterceptors([
        cancelInterceptor,
        cacheInterceptor,
        retryInterceptor,
        authInterceptor,
        loadingInterceptor,
        errorInterceptor,
      ]),
    ),
    provideIcons({
      serverCrash: lucideServerCrash,
      eye: lucideEye,
      eyeOff: lucideEyeOff,
      bookOpen: lucideBookOpen,
      triangle: lucideTriangle,
      mail: lucideMail,
      smartphone: lucideSmartphone,
      shieldCheck: lucideShieldCheck,
      arrowLeft: lucideArrowLeft,
      keyRound: lucideKeyRound,
      plus: lucidePlus,
      chevronLeft: lucideChevronLeft,
      chevronRight: lucideChevronRight,
      calendarOff: lucideCalendarOff,
      sparkles: lucideSparkles,
      inbox: lucideInbox,
      moreVertical: lucideMoreVertical,
      alertTriangle: lucideAlertTriangle,
      calendarClock: lucideCalendarClock,
      messageCircle: lucideMessageCircle,
      users: lucideUsers,
      target: lucideTarget,
      clock: lucideClock,
      checkCheck: lucideCheckCheck,
      alertCircle: lucideAlertCircle,
    }),
  ],
};
