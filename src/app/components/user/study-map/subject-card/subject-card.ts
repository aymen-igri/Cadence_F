import {
  Component,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  effect,
  untracked,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, ChevronDown, ChevronRight, MoreVertical, Plus } from 'lucide-angular';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { CommonModule } from '@angular/common';
import { GoalItemComponent } from '../goal-item/goal-item';
import { SubjectModel } from '@app/core/models/subject.model';
import { GoalService } from '@app/core/services/goal.service';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { SubjectService } from '@app/core/services/subject.service';
import { GoalFormDialogComponent } from '../goal-form-dialog/goal-form-dialog';
import { SubjectFormDialogComponent } from '../subject-form-dialog/subject-form-dialog';
import { LoadingSpinnerComponent } from '@app/components/shared/loading-spinner/loading-spinner.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-subject-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmButtonImports,
    LucideAngularModule,
    HlmBadgeImports,
    HlmDropdownMenuImports,
    GoalItemComponent,
    LucideAngularModule,
    GoalFormDialogComponent,
    SubjectFormDialogComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './subject-card.html',
})
export class SubjectCardComponent {
  private goalService = inject(GoalService);
  private alertService = inject(AlertService);
  private subjectService = inject(SubjectService);
  subject = input.required<SubjectModel>();
  isExpanded = input<boolean>(false);
  toggleExpand = output<void>();
  isSheetOpen = signal(false);
  createGoalDialogState = signal<'closed' | 'open'>('closed');
  protected ChevronDown = ChevronDown;
  protected ChevronRight = ChevronRight;
  protected MoreVertical = MoreVertical;
  protected Plus = Plus;
  readonly goals = this.goalService.allGoals.data;
  readonly isLoadingGoals = this.goalService.allGoals.isLoading;
  updateSubjectDialogState = signal<'closed' | 'open'>('closed');

  expandedGoalId: string | null = null;

  readonly deleteSubject = createMutation({
    mutationFn: (subjectId: string) => this.subjectService.deleteSubject(subjectId),
    onSuccess: () => {
      toast.success('Subject deleted', {
        description: 'The subject has been removed from your study map.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete subject', {
        description: error,
      });
      console.error('Failed to delete subject :', error);
    },
  });

  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (this.isExpanded()) {
        untracked(() => {
          this.goalService
            .loadAllGoals(this.subject().id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        });
      }
    });
  }

  toggleGoal(goalId: string) {
    if (this.expandedGoalId === goalId) {
      this.expandedGoalId = null;
    } else {
      this.expandedGoalId = goalId;
    }
  }

  getBorderColor() {
    switch (this.subject().priority) {
      case 'HIGH':
        return 'border-l-destructive';
      case 'MEDIUM':
        return 'border-l-amber-500';
      case 'LOW':
        return 'border-l-blue-500';
      default:
        return 'border-l-border';
    }
  }

  getBadgeVariant() {
    switch (this.subject().priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'default';
    }
  }

  onDeleteSubject(subjectId: string) {
    this.alertService.show({
      description: 'Are you sure you want to delete this subject?',
      variant: 'destructive',
      actionLabel: 'Delete',
      action: () => {
        this.deleteSubject.mutate(subjectId);
      },
    });
  }
}
