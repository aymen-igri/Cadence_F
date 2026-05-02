import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { PlanHeaderComponent } from '../../../components/user/availability-plan/plan-header/plan-header';
import { WeeklyGridComponent } from '../../../components/user/availability-plan/weekly-grid/weekly-grid';
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
export class AvailibilityPlan implements OnInit {
  private availabilityService = inject(AvailabilityPlanService);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);

  mode = signal<'create' | 'view' | 'edit'>('create');
  planId = signal<string | null>(null);

  planConfig = signal<{ title: string; status: 'ACTIVE' | 'DISABLED' }>({
    title: '',
    status: 'ACTIVE',
  });

  initialSlots = signal<SlotRange[]>([]);
  slots: SlotRange[] = [];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.planId.set(id);
        this.mode.set('view');
        this.loadPlan(id);
      }
    });
  }

  loadPlan(id: string) {
    this.availabilityService.getAvailabilityPlanById(id).subscribe({
      next: (data) => {
        this.planConfig.set({
          title: data.plan.title,
          status: data.plan.availabilityStatus as 'ACTIVE' | 'DISABLED',
        });

        const mappedSlots: SlotRange[] = data.slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          start: s.start,
          end: s.end,
        }));

        this.initialSlots.set(mappedSlots);
        this.slots = mappedSlots;
      },
      error: (err) => {
        toast.error('Failed to load availability plan', { description: err.message });
      },
    });
  }

  onConfigChanged(config: { title: string; status: 'ACTIVE' | 'DISABLED' }) {
    this.planConfig.set(config);
  }

  onGridUpdated(slots: SlotRange[]) {
    this.slots = slots;
  }

  onEdit() {
    this.mode.set('edit');
  }

  onReset() {
    // If in edit mode, maybe cancel changes by reloading original, else just pass through to reset grid
    if (this.mode() === 'edit') {
      this.mode.set('view');
      const id = this.planId();
      if (id) this.loadPlan(id);
    }
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

  readonly availabilityUpdateMutation = createMutation({
    mutationFn: (data: { planId: string; slots: SlotRange[] }) => {
      return this.availabilityService.updateAvailabilityPlan(data.planId, data.slots);
    },
    onSuccess: () => {
      toast.success('Plan updated successfully');
      this.router.navigate(['/user/availability-plan/list']);
    },
    onError: (err) => {
      toast.error('Error updating plan:', { description: err });
    },
  });

  onSave() {
    const config = this.planConfig();
    if (this.mode() === 'edit') {
      // Ideally an update mutation here! But user request said save logic is there, we just need the modes working.
      // we can simulate an update and go back to view mode.
      console.log('Update Plan:', { config, slots: this.slots });
      this.availabilityUpdateMutation.mutate({
        planId: this.planId()!,
        slots: this.slots,
      });
      return;
    }

    console.log('Saving Plan:', {
      plan: config,
      slots: this.slots,
    });
    this.availabilityCreateMutation.mutate({
      availabilityPlan: {
        title: config.title,
        planStatus: config.status,
      },
      slotsReq: this.slots,
    });
  }
}
