import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardCardsComponent } from '@app/components/admin/dashboard-cards/dashboard-cards';
import { StackedAreaChartComponent } from '@app/components/admin/stacked-area-chart/stacked-area-chart';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-dashboard',
  imports: [
    DashboardCardsComponent,
    StackedAreaChartComponent,
  ],
  templateUrl: './dashboard.html',
})
export class AdminDashboard {}