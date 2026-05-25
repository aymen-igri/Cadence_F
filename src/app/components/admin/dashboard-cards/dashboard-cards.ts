import { Component, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { DashboardService, DashboardCardsData } from '@app/core/services/dashboard.service';
import { toast } from 'ngx-sonner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-cards',
  imports: [
    ...HlmCardImports,
    ...HlmSkeletonImports,
  ],
  templateUrl: './dashboard-cards.html',
})
export class DashboardCardsComponent {
  private readonly dashboardService = inject(DashboardService);

  cardsData = signal<DashboardCardsData | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    effect(() => this.loadCardsData());
  }

  private loadCardsData() {
    this.isLoading.set(true);
    this.dashboardService.getCardsData().subscribe({
      next: (data) => {
        this.cardsData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Failed to load dashboard cards', {
          description: 'Unable to fetch statistics',
        });
        this.isLoading.set(false);
      },
    });
  }
}
