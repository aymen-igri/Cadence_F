import { Component, ChangeDetectionStrategy, inject, signal, effect, computed, DestroyRef } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgxEchartsDirective } from 'ngx-echarts';
import { GroupsManagementService, GroupDetailsResponse } from '@app/core/services/groups-management.service';
import { toast } from 'ngx-sonner';
import * as echarts from 'echarts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface DialogData {
  groupId: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-groups-detail-modal',
  standalone: true,
  imports: [
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmSkeletonImports,
    NgxEchartsDirective,
  ],
  templateUrl: './groups-detail-modal.html',
})
export class GroupsDetailModalComponent {
  private readonly groupsManagementService = inject(GroupsManagementService);
  private readonly dialogRef = inject(DialogRef<void>);
  private readonly dialogData = inject<DialogData>(DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  groupDetails = signal<GroupDetailsResponse | null>(null);
  isLoading = signal<boolean>(true);

  joinRequestsPieChartOptions = computed(() => {
    const details = this.groupDetails();
    if (!details) {
      return {};
    }

    const { pendingReq, acceptedReq, rejectedReq } = details.joinReqData;

    const data = [
      { value: pendingReq, name: 'Pending', itemStyle: { color: '#f59e0b' } },
      { value: acceptedReq, name: 'Accepted', itemStyle: { color: '#10b981' } },
      { value: rejectedReq, name: 'Rejected', itemStyle: { color: '#ef4444' } },
    ];

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#ffffff' },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '3%',
        top: 'center',
        textStyle: { color: '#6b7280', fontSize: 12 },
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['35%', '50%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'outside',
            color: '#374151',
            fontSize: 11,
          },
        },
      ],
    };
  });

  messageActivityBarChartOptions = computed(() => {
    const details = this.groupDetails();
    if (!details || details.messageActivity.length === 0) {
      return {};
    }

    const dates = details.messageActivity.map((m) => m.date);
    const counts = details.messageActivity.map((m) => m.messageCount);

    return {
      color: ['#3b82f6'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#ffffff' },
      },
      grid: {
        left: '8%',
        right: '5%',
        top: '10%',
        bottom: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#d1d5db' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#d1d5db' } },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1e40af' },
            ]),
          },
          label: {
            show: true,
            position: 'top',
            color: '#374151',
            fontSize: 11,
            fontWeight: 'bold',
          },
        },
      ],
    };
  });

  constructor() {
    effect(() => this.loadGroupDetails());
  }

  private loadGroupDetails() {
    this.isLoading.set(true);
    this.groupsManagementService
      .getGroupDetails(this.dialogData.groupId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.groupDetails.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          toast.error('Failed to load group details');
          this.isLoading.set(false);
        },
      });
  }

  onReload() {
    this.loadGroupDetails();
  }

  onClose() {
    this.dialogRef.close();
  }

  getPrivacyBadgeClass(privacy: string): string {
    switch (privacy) {
      case 'PUBLIC':
        return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/30';
      case 'PRIVATE':
        return 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 border-gray-500/30';
    }
  }

  getMemberRoleBadgeClass(role: string): string {
    switch (role) {
      case 'OWNER':
        return 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20';
      case 'MODERATOR':
        return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20';
      case 'MEMBER':
        return 'bg-green-500/10 text-green-700 hover:bg-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20';
    }
  }
}
