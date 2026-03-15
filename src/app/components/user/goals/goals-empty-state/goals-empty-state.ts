import { Component } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-goals-empty-state',
  standalone: true,
  imports: [HlmCardImports],
  templateUrl: './goals-empty-state.html',
})
export class GoalsEmptyStateComponent {}
