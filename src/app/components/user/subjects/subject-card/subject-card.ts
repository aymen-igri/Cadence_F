import { Component, Input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LucideAngularModule, BookOpen } from 'lucide-angular';

export interface SubjectCardData {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  sessionsPerWeek: number;
  color: string;
}

@Component({
  selector: 'app-subject-card',
  imports: [LucideAngularModule, ...HlmCardImports],
  templateUrl: './subject-card.html',
})
export class SubjectCard {
  @Input() subject!: SubjectCardData;
  readonly BookOpen = BookOpen;
}
