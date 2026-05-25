import { Component, inject, signal, ChangeDetectionStrategy, effect, computed } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService, StackedAreaChartData } from '@app/core/services/dashboard.service';
import { toast } from 'ngx-sonner';

interface ChartDataTransformed {
  completed: number[];
  pending: number[];
  incomplete: number[];
  days: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-stacked-area-chart',
  imports: [
    ...HlmCardImports,
    ...HlmSkeletonImports,
    NgxEchartsDirective,
  ],
  templateUrl: './stacked-area-chart.html',
})
export class StackedAreaChartComponent {
  private readonly dashboardService = inject(DashboardService);

  chartData = signal<StackedAreaChartData | null>(null);
  isLoading = signal<boolean>(false);

  chartOptions = computed(() => {
    const data = this.chartData();
    if (!data) return null;

    const transformed = this.transformChartData(data);
    return this.buildChartOptions(transformed);
  });

  constructor() {
    effect(() => this.loadChartData());
  }

  private loadChartData() {
    this.isLoading.set(true);
    this.dashboardService.getStackedAreaChartData().subscribe({
      next: (data) => {
        this.chartData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Failed to load stacked area chart', {
          description: 'Unable to fetch subsession data',
        });
        this.isLoading.set(false);
      },
    });
  }

  private transformChartData(data: StackedAreaChartData): ChartDataTransformed {
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    
    // Initialize counts for each day
    const counts: Record<string, { completed: number; pending: number; incomplete: number }> = {};
    dayOrder.forEach(day => {
      counts[day] = { completed: 0, pending: 0, incomplete: 0 };
    });

    // Count subsessions by day
    data.completedSubSession.forEach(item => {
      if (counts[item.dayOfWeek]) counts[item.dayOfWeek].completed++;
    });

    data.pendingSubSession.forEach(item => {
      if (counts[item.dayOfWeek]) counts[item.dayOfWeek].pending++;
    });

    data.incompletedSubSession.forEach(item => {
      if (counts[item.dayOfWeek]) counts[item.dayOfWeek].incomplete++;
    });

    // Transform to array format
    return {
      days: dayOrder,
      completed: dayOrder.map(day => counts[day].completed),
      pending: dayOrder.map(day => counts[day].pending),
      incomplete: dayOrder.map(day => counts[day].incomplete),
    };
  }

  private buildChartOptions(data: ChartDataTransformed): EChartsOption {
    return {
      color: ['#10b981', '#f59e0b', '#ef4444'], // Green, Amber, Red
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7089',
          },
        },
      },
      legend: {
        data: ['Completed', 'Pending', 'Incomplete'],
        top: 20,
      },
      grid: {
        left: '10%',
        right: '10%',
        top: 80,
        bottom: 60,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.days.map(day => this.formatDay(day)),
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
          },
        },
      },
      series: [
        {
          name: 'Completed',
          type: 'line',
          data: data.completed,
          smooth: true,
          areaStyle: {
            color: 'rgba(16, 185, 129, 0.1)',
          },
          itemStyle: {
            color: '#10b981',
          },
        },
        {
          name: 'Pending',
          type: 'line',
          data: data.pending,
          smooth: true,
          areaStyle: {
            color: 'rgba(245, 158, 11, 0.1)',
          },
          itemStyle: {
            color: '#f59e0b',
          },
        },
        {
          name: 'Incomplete',
          type: 'line',
          data: data.incomplete,
          smooth: true,
          areaStyle: {
            color: 'rgba(239, 68, 68, 0.1)',
          },
          itemStyle: {
            color: '#ef4444',
          },
        },
      ],
    };
  }

  private formatDay(day: string): string {
    return day.substring(0, 3); // MON, TUE, WED, etc.
  }
}
