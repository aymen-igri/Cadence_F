import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { CreateGoalRequest, CreateGoalTask, Goal, Task } from '../models/goal.model';
import { createQuery } from '../utils/query.helper';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}`;
  readonly allGoals = createQuery<Goal[]>([]);
  readonly allTasks = createQuery<Task[]>([])

  public loadAllGoals(subjectId: string) {
    return this.allGoals.load(this.http.get<Goal[]>(`${this.url}/goal/all/${subjectId}`));
  }

  public loadAllTasks(goalId: string) {
    return this.allTasks.load(this.http.get<Task[]>(`${this.url}/task/all/${goalId}`))
  }

  public createSubjectGoal(payload: CreateGoalRequest, subjectId: string) {
    return this.http.post<Goal>(`${this.url}/goal/create/${subjectId}`, payload).pipe(
      tap((newGoal) => {
        this.allGoals.mutate((goals) => [...goals, newGoal]);
      }),
    );
  }

  public createGoalTask(payload: CreateGoalTask, goalId: string){
    return this.http.post<Task>(`${this.url}/task/create/${goalId}`,payload).pipe(
        tap((newTask) => {
            this.allTasks.mutate((tasks) => [...tasks, newTask]);
        }),
    );
  }


  public deleteGoal(goalId: string) {
    return this.http.delete(`${this.url}/goal/delete/${goalId}`).pipe(
      tap(() => {
        this.allGoals.mutate((goals) =>
          goals.filter((goal) => goal.id !== goalId),
        );
      }),
    );
  }
}
