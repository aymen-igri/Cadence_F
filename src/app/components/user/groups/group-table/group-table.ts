import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { GroupResponse } from '@app/core/models/group.model';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-group-data-table',
  imports: [
    TitleCasePipe,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    RouterLink,
  ],
  host: {
    class: 'w-full',
  },
  templateUrl: './group-table.html',
})
export class GroupDataTable {
  private alertService = inject(AlertService);

  groups = input.required<GroupResponse[]>();
  joinClick = output<string>();
  requestJoinClick = output<string>();

  protected filterText = signal('');
  protected expandedRows = signal<Set<string>>(new Set());

  protected filteredGroups = computed(() => {
    const q = this.filterText().toLowerCase().trim();
    if (!q) return this.groups();
    return this.groups().filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q),
    );
  });

  protected isExpanded(id: string): boolean {
    return this.expandedRows().has(id);
  }

  protected toggleRow(id: string): void {
    this.expandedRows.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  onJoinClick(event: Event, groupId: string): void {
    event.stopPropagation();
    this.joinClick.emit(groupId);
  }

  onRequestJoinClick(event: Event, groupId: string): void {
    event.stopPropagation();
    this.alertService.show({
      actionLabel: 'Request to Join',
      description:
        'Your request to join this group has been sent. The group admins will review your request and notify you of the outcome.',
      variant: 'default',
      action: () => {
        this.requestJoinClick.emit(groupId);
      },
    });
  }
}
