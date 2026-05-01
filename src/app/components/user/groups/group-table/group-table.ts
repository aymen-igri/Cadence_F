import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { GroupResponse } from '@app/core/models/group.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import {
  type ColumnDef,
  type ColumnFiltersState,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/angular-table';
import { LucideAngularModule, SquareArrowOutUpRight, Ellipsis } from 'lucide-angular';

@Component({
  selector: 'app-group-data-table',
  imports: [
    FlexRenderDirective,
    FormsModule,
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmBadgeImports,
    NgIcon,
    HlmIconImports,
    HlmInputImports,
    HlmTableImports,
    HlmDropdownMenuImports,
    HlmButtonImports,
    LucideAngularModule,
    RouterLink,
    NgTemplateOutlet,
  ],
  providers: [provideIcons({ lucideChevronDown })],
  host: {
    class: 'w-full',
  },
  templateUrl: './group-table.html',
})
export class GroupDataTable implements OnInit {
  private alertService = inject(AlertService);
  SquareArrowOutUpRight = SquareArrowOutUpRight;
  Ellipsis = Ellipsis;

  actionsCell = viewChild.required<TemplateRef<any>>('actionsCell');
  protected _filterChanged(event: Event) {
    this._table.getColumn('name')?.setFilterValue((event.target as HTMLInputElement).value);
  }

  protected readonly _columns = computed<ColumnDef<GroupResponse>[]>(() => {
    const baseColumns: ColumnDef<GroupResponse>[] = [
      {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        id: 'name',
        header: 'Name',
        enableSorting: true,
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: 'Description',
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorFn: (row) =>
          row.privacyLevel.charAt(0).toUpperCase() + row.privacyLevel.slice(1).toLowerCase(),
        id: 'privacyLevel',
        header: 'Privacy',
        enableSorting: false,
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: 'membersCount',
        id: 'memberCount',
        header: 'Members',
        enableSorting: true,
        cell: (info) => info.getValue<number>(),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
    ];

    return baseColumns;
  });

  private readonly _columnFilters = signal<ColumnFiltersState>([]);
  private readonly _sorting = signal<SortingState>([]);
  private readonly _rowSelection = signal<RowSelectionState>({});
  private readonly _columnVisibility = signal<VisibilityState>({});
  groups = input.required<GroupResponse[]>();
  readonly isClickable = input<boolean>(true);
  protected _table!: ReturnType<typeof createAngularTable<GroupResponse>>;
  joinClick = output<string>();
  requestJoinClick = output<string>();
  ngOnInit() {
    this._table = createAngularTable<GroupResponse>(() => ({
      data: this.groups(),
      columns: this._columns(),
      onSortingChange: (updater) => {
        updater instanceof Function ? this._sorting.update(updater) : this._sorting.set(updater);
      },
      onColumnFiltersChange: (updater) => {
        updater instanceof Function
          ? this._columnFilters.update(updater)
          : this._columnFilters.set(updater);
      },
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: (updater) => {
        updater instanceof Function
          ? this._columnVisibility.update(updater)
          : this._columnVisibility.set(updater);
      },
      state: {
        sorting: this._sorting(),
        columnFilters: this._columnFilters(),
        columnVisibility: this._columnVisibility(),
        rowSelection: this._rowSelection(),
      },
    }));
  }
  protected get _hidableColumns() {
    return this._table.getAllColumns().filter((column) => column.getCanHide()) ?? [];
  }

  protected _filterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const typedValue = target.value;
    this._table.setGlobalFilter(typedValue);
  }
  onJoinClick(event: Event, groupId: string) {
    event.stopPropagation();
    this.joinClick.emit(groupId);
  }

  onRequestJoinClick(event: Event, groupId: string) {
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
