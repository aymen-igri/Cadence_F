import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

/** Minimal ThemeService stub — no localStorage access */
const mockThemeService = {
  theme: signal<'light' | 'dark'>('dark'),
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
};

/** Minimal AuthService stub — no localStorage or Router access */
const mockAuthService = {
  currentUser: signal(null),
  isReady: signal(true),
  isLoggedIn: vi.fn().mockReturnValue(false),
  getAccessToken: vi.fn().mockReturnValue(null),
  getRefreshToken: vi.fn().mockReturnValue(null),
  logout: vi.fn(),
};

/**
 * jsdom does not implement window.matchMedia.
 * NgxSonnerToaster calls it during construction, so we stub it here.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideIcons({}),
        { provide: ThemeService, useValue: mockThemeService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
