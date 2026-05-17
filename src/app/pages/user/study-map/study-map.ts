import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconsModule } from '@ng-icons/core';
import { SubjectCardComponent } from '@app/components/user/study-map/subject-card/subject-card';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { SubjectService } from '@app/core/services/subject.service';
import { SubjectFormDialogComponent } from '@app/components/user/study-map/subject-form-dialog/subject-form-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface SubjTask {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
}

@Component({
  selector: 'app-study-map',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    NgIconsModule,
    SubjectCardComponent,
    HlmCardImports,
    SubjectFormDialogComponent,
  ],
  templateUrl: './study-map.html',
})
export class StudyMapComponent {
  private subjectService = inject(SubjectService);
  private destroyRef = takeUntilDestroyed();

  readonly subjects = this.subjectService.allSubjects.data;
  readonly isSubjectsLoading = this.subjectService.allSubjects.isLoading;
  createSubjectDialogState = signal<'closed' | 'open'>('closed');

  ngOnInit() {
    this.subjectService.loadAllSubjects()
      .pipe(this.destroyRef)
      .subscribe();
  }
  expandedSubjectId: string | null = null;

  toggleSubject(subjectId: string) {
    if (this.expandedSubjectId === subjectId) {
      this.expandedSubjectId = null;
    } else {
      this.expandedSubjectId = subjectId;
    }
  }
}
