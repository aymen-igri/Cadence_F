import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [HlmCardImports,DatePipe],
  templateUrl: './goal-card.html',
})
export class GoalCardComponent {
  @Input() goal!: {
    id: number;
    title: string;
    subject: string;
    deadline: string;
    progress: number;
    description: string;
  };

  get daysLeft(): number {
    const deadline = new Date(this.goal.deadline);
    const today = new Date();
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}
