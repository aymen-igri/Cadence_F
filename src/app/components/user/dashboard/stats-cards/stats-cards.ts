import { Component } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-stats-cards',
  imports: [NgIconsModule, ...HlmCardImports],
  templateUrl: './stats-cards.html',
})
export class StatsCards {
  readonly stats = [
    { label: 'Active Subjects', value: '6', icon: 'bookOpen', delta: '+1 this week' },
    { label: 'Goals In Progress', value: '4', icon: 'target', delta: '2 due soon' },
    { label: 'Study Hours', value: '12h', icon: 'clock', delta: 'this week' },
    { label: 'Tasks Completed', value: '18', icon: 'checkCheck', delta: 'this week' },
  ];
}
