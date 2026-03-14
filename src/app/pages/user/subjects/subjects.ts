import { Component } from '@angular/core';
import { SubjectsHeader } from '../../../components/user/subjects/subjects-header/subjects-header';
import { SubjectsList } from '../../../components/user/subjects/subjects-list/subjects-list';

@Component({
  selector: 'app-subjects',
  imports: [SubjectsHeader, SubjectsList],
  templateUrl: './subjects.html',
})
export class Subjects {}
