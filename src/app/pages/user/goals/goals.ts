import { Component } from '@angular/core';
import { GoalsHeaderComponent } from '../../..//components/user/goals/goals-header/goals-header';
import { GoalsListComponent } from '../../../components/user/goals/goals-list/goals-list';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [GoalsHeaderComponent, GoalsListComponent],
  templateUrl: './goals.html',
  styleUrl: './goals.css',
})
export class GoalsComponent {}
