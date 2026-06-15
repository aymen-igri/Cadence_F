import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockStore: Record<string, string>;
  let classList: { add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockStore = {};

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; },
    });

    // Spy on classList via the real documentElement
    classList = { add: vi.fn(), remove: vi.fn() };
    vi.spyOn(document.documentElement.classList, 'add').mockImplementation(classList.add as any);
    vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(classList.remove as any);

    TestBed.configureTestingModule({ providers: [ThemeService] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ─── Initialisation ───────────────────────────────────────────────────────

  it('should default to dark theme when no preference is stored', () => {
    service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(classList.add).toHaveBeenCalledWith('dark');
  });

  it('should restore the "light" theme from localStorage on init', () => {
    mockStore['theme-preference'] = 'light';

    service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(classList.remove).toHaveBeenCalledWith('dark');
  });

  it('should restore the "dark" theme from localStorage on init', () => {
    mockStore['theme-preference'] = 'dark';

    service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
    expect(classList.add).toHaveBeenCalledWith('dark');
  });

  it('should default to dark when an invalid value is stored', () => {
    mockStore['theme-preference'] = 'blue'; // invalid

    service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });

  // ─── setTheme ─────────────────────────────────────────────────────────────

  it('should update the signal, persist to localStorage and apply CSS class when setTheme("light") is called', () => {
    service = TestBed.inject(ThemeService);
    classList.add.mockClear();
    classList.remove.mockClear();

    service.setTheme('light');

    expect(service.theme()).toBe('light');
    expect(mockStore['theme-preference']).toBe('light');
    expect(classList.remove).toHaveBeenCalledWith('dark');
  });

  it('should update the signal, persist to localStorage and apply CSS class when setTheme("dark") is called', () => {
    mockStore['theme-preference'] = 'light';
    service = TestBed.inject(ThemeService);
    classList.add.mockClear();

    service.setTheme('dark');

    expect(service.theme()).toBe('dark');
    expect(mockStore['theme-preference']).toBe('dark');
    expect(classList.add).toHaveBeenCalledWith('dark');
  });

  // ─── toggleTheme ──────────────────────────────────────────────────────────

  it('should switch from dark to light when toggleTheme is called', () => {
    service = TestBed.inject(ThemeService); // starts in dark

    service.toggleTheme();

    expect(service.theme()).toBe('light');
    expect(mockStore['theme-preference']).toBe('light');
  });

  it('should switch from light to dark when toggleTheme is called', () => {
    mockStore['theme-preference'] = 'light';
    service = TestBed.inject(ThemeService);

    service.toggleTheme();

    expect(service.theme()).toBe('dark');
    expect(mockStore['theme-preference']).toBe('dark');
  });

  it('should correctly alternate on repeated toggleTheme calls', () => {
    service = TestBed.inject(ThemeService); // dark

    service.toggleTheme(); // light
    service.toggleTheme(); // dark
    service.toggleTheme(); // light

    expect(service.theme()).toBe('light');
  });
});
