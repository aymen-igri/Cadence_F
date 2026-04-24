import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { CreateSubjectRequest, SubjectModel } from '../models/subject.model';
import { createQuery } from '../utils/query.helper';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly url = `${environment.apiUrl}/subject`;
  private http = inject(HttpClient);
  readonly allSubjects = createQuery<SubjectModel[]>([]);

  public loadAllSubjects() {
    return this.allSubjects.load(this.http.get<SubjectModel[]>(`${this.url}/all`));
  }

  public createSubject(payload: CreateSubjectRequest) {
    return this.http.post<SubjectModel>(`${this.url}/create`, payload).pipe(
      tap((newSubject) => {
        this.allSubjects.mutate((subjects) => [...subjects, newSubject]);
      }),
    );
  }

  public deleteSubject(subjectId: string) {
    return this.http.delete(`${this.url}/delete/${subjectId}`).pipe(
      tap(() => {
        this.allSubjects.mutate((subjects) =>
          subjects.filter((subject) => subject.id !== subjectId),
        );
      }),
    );
  }
}
