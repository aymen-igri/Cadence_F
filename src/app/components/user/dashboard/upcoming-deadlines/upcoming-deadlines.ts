import { Component } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-upcoming-deadlines',
  imports: [...HlmCardImports, NgIconsModule],
  templateUrl: './upcoming-deadlines.html',
})
export class UpcomingDeadlines {
  readonly deadlines = [
    {
      task: 'Submit Physics Lab Report',
      goal: 'Physics Lab Report',
      dueIn: 'Due today',
      urgent: true,
      icon: 'alertCircle',
    },
    {
      task: 'Complete Integration exercises',
      goal: 'Finish Calculus Module',
      dueIn: 'Due tomorrow',
      urgent: false,
      icon: 'clock',
    },
    {
      task: 'Push CS Assignment #3',
      goal: 'CS Assignment #3',
      dueIn: 'In 3 days',
      urgent: false,
      icon: 'clock',
    },
  ];
}
