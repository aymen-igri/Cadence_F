import { Component, inject, signal, ChangeDetectionStrategy, effect, computed } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService, HeatmapRequestPayload, HeatmapChartData } from '@app/core/services/dashboard.service';
import { toast } from 'ngx-sonner';

interface HeatmapDataPoint {
  dayIndex: number;
  hour: number;
  value: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-heatmap-chart',
  imports: [
    ...HlmCardImports,
    ...HlmSkeletonImports,
    NgxEchartsDirective,
  ],
  templateUrl: './heatmap-chart.html',
})
export class HeatmapChartComponent {
  private readonly dashboardService = inject(DashboardService);

  chartData = signal<HeatmapChartData | null>(null);
  isLoading = signal<boolean>(false);

  chartOptions = computed(() => {
    const data = this.chartData();
    if (!data) return null;
    return this.buildChartOptions(data);
  });

  constructor() {
    effect(() => this.loadChartData());
  }

  private loadChartData() {
    this.isLoading.set(true);
    
    // Get current week and year
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    const payload: HeatmapRequestPayload = {
      weekNumber,
      year,
    };

    this.dashboardService.getHeatmapChartData(payload).subscribe({
      next: (data) => {
        this.chartData.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Failed to load heatmap', {
          description: 'Unable to fetch subsession creation data',
        });
        this.isLoading.set(false);
      },
    });
  }

  private buildChartOptions(data: HeatmapChartData): EChartsOption {
    const heatmapData = this.transformHeatmapData(data);
    const dayLabels = data.heatMapChartData.map(d => this.formatDay(d.dayOfWeek));
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.componentSubType === 'heatmap') {
            const hour = params.value[0];
            const dayIndex = params.value[1];
            const count = params.value[2];
            const day = dayLabels[dayIndex];
            const hourStr = hourLabels[hour];
            return `${day} ${hourStr}: ${count} subsessions`;
          }
          return '';
        },
      },
      grid: {
        height: 280,
        left: 70,
        right: 80,
        bottom: 80,
        top: 20,
      },
      xAxis: {
        type: 'category',
        data: hourLabels,
        splitArea: {
          show: true,
        },
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'category',
        data: dayLabels,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 0,
        max: this.getMaxValue(heatmapData),
        calculable: true,
        orient: 'vertical',
        right: '5%',
        inRange: {
          color: ['#1D1D1D', '#2d2d2d', '#686767', '#aaaaaa', 'rgb(255, 255, 255)'],
        },
      },
      series: [
        {
          name: 'Subsession Count',
          type: 'heatmap',
          data: heatmapData,
          emphasis: {
            itemStyle: {
              borderColor: '#000',
              borderWidth: 1,
            },
          },
        },
      ],
    };
  }

  private transformHeatmapData(data: HeatmapChartData): number[][] {
    const result: number[][] = [];
    
    // Create a map for quick lookup of subsession counts
    const countMap = new Map<string, number>();
    
    data.heatMapChartData.forEach((dayData, dayIndex) => {
      dayData.subSessionData.forEach(sessionData => {
        const hour = parseInt(sessionData.creationHour, 10);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          countMap.set(`${dayIndex}-${hour}`, sessionData.subSessionCount);
        }
      });
    });

    // Create complete 7x24 grid (hours on X-axis, days on Y-axis)
    for (let dayIndex = 0; dayIndex < data.heatMapChartData.length; dayIndex++) {
      for (let hour = 0; hour < 24; hour++) {
        const count = countMap.get(`${dayIndex}-${hour}`) || 0;
        result.push([hour, dayIndex, count]); // Swap: [hour, day, value]
      }
    }

    return result;
  }

  private getMaxValue(data: number[][]): number {
    return Math.max(...data.map(d => d[2]), 1);
  }

  private formatDay(day: string): string {
    return day.substring(0, 3); // MON, TUE, WED, etc.
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
