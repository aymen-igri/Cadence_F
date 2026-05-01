import { Component } from '@angular/core';
import { StatsCards } from '@app/components/user/dashboard/stats-cards/stats-cards';
import { TodaysSchedule } from '@app/components/user/dashboard/todays-schedule/todays-schedule';
import { GoalsProgress } from '@app/components/user/dashboard/goals-progress/goals-progress';
import { GroupActivity } from '@app/components/user/dashboard/group-activity/group-activity';
import { UpcomingDeadlines } from '@app/components/user/dashboard/upcoming-deadlines/upcoming-deadlines';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, Sparkles } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatsCards,
    TodaysSchedule,
    GoalsProgress,
    GroupActivity,
    UpcomingDeadlines,
    LucideAngularModule,
    ...HlmButtonImports,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly Sparkles = Sparkles;
}
