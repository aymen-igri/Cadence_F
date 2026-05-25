import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DashboardCardsData {
  registredUsersCount: number;
  weeklyPlanCount: number;
  groupsCount: number;
  subjectsCount: number;
}

export interface SubSessionData {
  dayOfWeek: string;
  startTime: string;
}

export interface StackedAreaChartData {
  completedSubSession: SubSessionData[];
  pendingSubSession: SubSessionData[];
  incompletedSubSession: SubSessionData[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/admin/dashboard`;
  private http = inject(HttpClient);

  getCardsData() {
    return this.http.get<DashboardCardsData>(`${this.apiUrl}/cards`);
  }

  getStackedAreaChartData() {
    return this.http.get<StackedAreaChartData>(`${this.apiUrl}/charts/stackedArea`);
  }
}
