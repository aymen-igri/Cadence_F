import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { PlanCardComponent } from '@app/components/user/availability-list/plan-card';
import { Plan } from '@app/core/models/availability.model';
import { AvailabilityPlanService } from '@app/core/services/availability-plan.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-availability-list',
  standalone: true,
  imports: [RouterLink, HlmButtonImports, HlmSkeletonImports, PlanCardComponent],
  templateUrl: './availability-list.html',
})
export class AvailabilityListComponent {
  private availabilityService = inject(AvailabilityPlanService);
  private destroyRef = takeUntilDestroyed();

  isLoading = this.availabilityService.allAvailabilityPlans.isLoading;
  readonly plans = this.availabilityService.allAvailabilityPlans.data;

  ngOnInit() {
    this.availabilityService.loadAllAvailabilityPlans()
      .pipe(this.destroyRef)
      .subscribe();
  }
}
