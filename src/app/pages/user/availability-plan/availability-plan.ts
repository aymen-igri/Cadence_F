import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { PlanHeaderComponent } from '../../../components/user/availability-plan/plan-header/plan-header';
import {
  WeeklyGridComponent
} from '../../../components/user/availability-plan/weekly-grid/weekly-grid';
import { PageActionsBarComponent } from '../../../components/user/availability-plan/page-actions-bar/page-actions-bar';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { CreateAvailabilityPlan, SlotRange } from '@app/core/models/availability.model';
import { AvailabilityPlanService } from '@app/core/services/availability-plan.service';

@Component({
  selector: 'app-availability-plan',
  templateUrl: './availability-plan.html',
  standalone: true,
  imports: [
    CommonModule,
    PlanHeaderComponent,
    WeeklyGridComponent,
    PageActionsBarComponent,
    HlmButtonImports,
    RouterLink,
  ],
})
export class AvailibilityPlan {
  private availabilityService = inject(AvailabilityPlanService);
  readonly router = inject(Router);
  planConfig = {
    title: '',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  };

  slots: SlotRange[] = [];

  onConfigChanged(config: { title: string; status: 'ACTIVE' | 'DISABLED' }) {
    this.planConfig = config;
  }

  onGridUpdated(slots: SlotRange[]) {
    this.slots = slots;
  }

  onReset() {
    console.log('Reset triggered');
    // Will need to reach into WeeklyGridComponent via @ViewChild to reset,
    // or re-bind grid state via inputs.
  }

  readonly availabilityCreateMutation = createMutation({
    mutationFn: (data: CreateAvailabilityPlan) => {
      return this.availabilityService.createAvailabilityPlan(data);
    },
    onSuccess: () => {
      toast.success('Plan saved successfully');
      this.router.navigate(['/user/availability-plan/list']);
    },
    onError: (err) => {
      toast.error('Error saving plan:', { description: err });
    },
  });

  onSave() {
    console.log('Saving Plan:', {
      plan: this.planConfig,
      slots: this.slots,
    });
    this.availabilityCreateMutation.mutate({
      availabilityPlan: {
        title: this.planConfig.title,
        planStatus: this.planConfig.status,
      },
      slotsReq: this.slots,
    });
  }
}
