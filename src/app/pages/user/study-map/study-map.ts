import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { SubjectCardComponent } from '../../../components/user/study-map/subject-card/subject-card';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { SubjectFormComponent } from '../../../components/user/study-map/subject-form/subject-form';
import { HlmCardImports } from '@spartan-ng/helm/card';

export interface SubjTask {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
}

export interface SubjGoal {
  id: string;
  title: string;
  progress: number;
  targetHoursPerWeek: number;
  deadline: string;
  status: string;
  tasks: SubjTask[];
}

export interface SubjDoc {
  id: string;
  name: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  goals: SubjGoal[];
}

@Component({
  selector: 'app-study-map',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    LucideAngularModule,
    SubjectCardComponent,
    HlmSheetImports,
    SubjectFormComponent,
    HlmCardImports,
  ],
  templateUrl: './study-map.html',
})
export class StudyMapComponent {
  protected Plus = Plus;

  // Mock data setup
  subjects: SubjDoc[] = [
    {
      id: 'sub-1',
      name: 'Computer Science 101',
      description: 'Introductory course to computer science principles and programming.',
      priority: 'HIGH',
      goals: [
        {
          id: 'goal-1',
          title: 'Master Data Structures',
          progress: 30,
          targetHoursPerWeek: 5,
          deadline: '2026-06-01',
          status: 'IN_PROGRESS',
          tasks: [
            {
              id: 'task-1',
              title: 'Read Arrays Chapter',
              description: 'Read chapter 4 on arrays',
              durationMinutes: 60,
              completed: true,
            },
            {
              id: 'task-2',
              title: 'Do Linked List exercises',
              description: 'Complete exercises 1 to 10',
              durationMinutes: 120,
              completed: false,
            },
          ],
        },
        {
          id: 'goal-2',
          title: 'Understand Algorithms',
          progress: 0,
          targetHoursPerWeek: 3,
          deadline: '2026-07-01',
          status: 'NOT_STARTED',
          tasks: [],
        },
      ],
    },
    {
      id: 'sub-2',
      name: 'Calculus II',
      description: 'Advanced calculus concepts including integration and series.',
      priority: 'MEDIUM',
      goals: [],
    },
  ];

  expandedSubjectId: string | null = null;

  toggleSubject(subjectId: string) {
    if (this.expandedSubjectId === subjectId) {
      this.expandedSubjectId = null;
    } else {
      this.expandedSubjectId = subjectId;
    }
  }
}
