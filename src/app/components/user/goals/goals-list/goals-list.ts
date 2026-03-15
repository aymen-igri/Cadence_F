import { Component } from '@angular/core';
import { GoalCardComponent } from '../goal-card/goal-card';
import { GoalsEmptyStateComponent } from '../goals-empty-state/goals-empty-state';

@Component({
  selector: 'app-goals-list',
  standalone: true,
  imports: [GoalCardComponent, GoalsEmptyStateComponent],
  templateUrl: './goals-list.html',
})
export class GoalsListComponent {
  goals = [
    {
      id: 1,
      title: 'Master linear algebra',
      subject: 'Mathematics',
      deadline: '2026-04-30',
      progress: 65,
      description: 'Complete all chapters and practice problems',
    },
    {
      id: 2,
      title: 'Learn quantum mechanics',
      subject: 'Physics',
      deadline: '2026-05-15',
      progress: 40,
      description: 'Understand fundamental concepts',
    },
  ];

  hasGoals(): boolean {
    return this.goals.length > 0;
  }
}
