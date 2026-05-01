import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { DatePipe } from '@angular/common';
import { Plan } from '@app/core/models/availability.model';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [RouterLink, HlmCardImports, HlmBadgeImports, DatePipe],
  template: `
    <a
      [routerLink]="['/user/availability-plan', plan().id]"
      class="block transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl ring-offset-background"
    >
      <div hlmCard>
        <div hlmCardHeader class="flex flex-row items-center justify-between pb-2">
          <h3 hlmCardTitle class="text-xl">{{ plan().title }}</h3>
          <span
            hlmBadge
            [variant]="plan().availabilityStatus === 'ACTIVE' ? 'default' : 'secondary'"
          >
            {{ plan().availabilityStatus }}
          </span>
        </div>
        <div hlmCardContent>
          <p hlmCardDescription>Created on {{ plan().createdAt | date: 'mediumDate' }}</p>
        </div>
      </div>
    </a>
  `,
})
export class PlanCardComponent {
  readonly plan = input.required<Plan>();
}
