import { Component } from '@angular/core';
import { LucideAngularModule, BookOpen } from 'lucide-angular';

@Component({
  selector: 'app-subjects-empty-state',
  imports: [LucideAngularModule],
  templateUrl: './subjects-empty-state.html',
})
export class SubjectsEmptyState {
  readonly BookOpen = BookOpen;
}
