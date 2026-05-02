import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AvailabilityPlan, CreateAvailabilityPlan, Plan, SlotRange } from '../models/availability.model';
import { createQuery } from '../utils/query.helper';

@Injectable({ providedIn: 'root' })
export class AvailabilityPlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/availability`;
  readonly allAvailabilityPlans = createQuery<Plan[]>([]);

  public createAvailabilityPlan(payload: CreateAvailabilityPlan) {
    return this.http.post<AvailabilityPlan>(`${this.apiUrl}/create`, payload);
  }

  public loadAllAvailabilityPlans() {
    return this.allAvailabilityPlans.load(this.http.get<Plan[]>(`${this.apiUrl}/all`));
  }

  public getAvailabilityPlanById(planId: string) {
    return this.http.get<AvailabilityPlan>(`${this.apiUrl}/${planId}`);
  }

  public updateAvailabilityPlan(planId: string, payload: SlotRange[]) {
    return this.http.put<AvailabilityPlan>(`${this.apiUrl}/${planId}/slots`, { slots: payload });
  }
}
