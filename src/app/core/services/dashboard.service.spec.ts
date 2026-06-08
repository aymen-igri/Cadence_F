import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService, DashboardCardsData, HeatmapRequestPayload } from './dashboard.service';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiUrl}/admin/dashboard`;

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── getCardsData ─────────────────────────────────────────────────────────

  it('should GET cards data from the correct endpoint', () => {
    const mockData: DashboardCardsData = {
      registredUsersCount: 100,
      weeklyPlanCount: 42,
      groupsCount: 15,
      subjectsCount: 30,
    };

    service.getCardsData().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/cards`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  // ─── getStackedAreaChartData ──────────────────────────────────────────────

  it('should GET stacked area chart data from the correct endpoint', () => {
    const mockData = {
      completedSubSession: [{ dayOfWeek: 'MONDAY', startTime: '09:00' }],
      pendingSubSession: [],
      incompletedSubSession: [],
    };

    service.getStackedAreaChartData().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/charts/stackedArea`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  // ─── getDoughnutChartData ─────────────────────────────────────────────────

  it('should GET doughnut chart data from the correct endpoint', () => {
    const mockData = { highPSubject: 5, mediumPSubject: 10, lowPSubject: 3 };

    service.getDoughnutChartData().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/charts/doughnut`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  // ─── getHeatmapChartData ──────────────────────────────────────────────────

  it('should POST heatmap chart data with the provided payload', () => {
    const payload: HeatmapRequestPayload = { weekNumber: 22, year: 2024 };
    const mockData = {
      localDateTime: '2024-06-01T00:00:00',
      heatMapChartData: [],
    };

    service.getHeatmapChartData(payload).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/charts/heatMap`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockData);
  });

  // ─── getTopGroups ─────────────────────────────────────────────────────────

  it('should GET top groups from the correct endpoint', () => {
    const mockData = [{ name: 'Group A', groupPrivacy: 'PUBLIC' as const, memberscount: 20 }];

    service.getTopGroups().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/tables/topGroups`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  // ─── getMFAActivities ─────────────────────────────────────────────────────

  it('should GET MFA activities from the correct endpoint', () => {
    const mockData = [
      {
        username: 'alice',
        type: 'EMAIL',
        attempts: 1,
        time: '2024-06-01T10:00:00',
        isUsed: true,
      },
    ];

    service.getMFAActivities().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${BASE}/tables/mfaActivities`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
