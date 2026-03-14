import { Component } from '@angular/core';
import { SubjectCard, SubjectCardData } from '../subject-card/subject-card';

@Component({
  selector: 'app-subjects-list',
  imports: [SubjectCard],
  templateUrl: './subjects-list.html',
})
export class SubjectsList {
  readonly subjects: SubjectCardData[] = [
    { name: 'Mathematics', priority: 'High', sessionsPerWeek: 4, color: 'bg-primary' },
    { name: 'Physics', priority: 'Medium', sessionsPerWeek: 3, color: 'bg-secondary' },
    { name: 'Computer Science', priority: 'High', sessionsPerWeek: 5, color: 'bg-primary' },
    { name: 'English', priority: 'Low', sessionsPerWeek: 2, color: 'bg-secondary' },
  ];
}
