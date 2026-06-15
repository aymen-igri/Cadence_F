import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GoalService } from './goal.service';
import { environment } from '../../environments/environment';
import { Goal, Task } from '../models/goal.model';

const BASE = `${environment.apiUrl}`;

const mockGoal = (id = 'g1'): Goal => ({
  id,
  title: 'Master TypeScript',
  targetHoursPerWeek: 10,
  progress: 0,
});

const mockTask = (id = 't1'): Task => ({
  id,
  title: 'Read docs',
  description: 'Read the TS handbook',
  status: 'PENDING',
});

describe('GoalService', () => {
  let service: GoalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoalService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GoalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── loadAllGoals ─────────────────────────────────────────────────────────

  it('should GET goals for a subject and set allGoals.data', () => {
    const goals = [mockGoal('g1'), mockGoal('g2')];

    service.loadAllGoals('sub1').subscribe();

    const req = httpMock.expectOne(`${BASE}/goal/all/sub1`);
    expect(req.request.method).toBe('GET');
    req.flush(goals);

    expect(service.allGoals.data()).toEqual(goals);
  });

  it('should set allGoals.isLoading to false after loadAllGoals completes', () => {
    service.loadAllGoals('sub1').subscribe();

    const req = httpMock.expectOne(`${BASE}/goal/all/sub1`);
    req.flush([]);

    expect(service.allGoals.isLoading()).toBe(false);
  });

  // ─── loadAllTasks ─────────────────────────────────────────────────────────

  it('should GET tasks for a goal and set allTasks.data', () => {
    const tasks = [mockTask('t1')];

    service.loadAllTasks('g1').subscribe();

    const req = httpMock.expectOne(`${BASE}/task/all/g1`);
    expect(req.request.method).toBe('GET');
    req.flush(tasks);

    expect(service.allTasks.data()).toEqual(tasks);
  });

  // ─── createSubjectGoal ────────────────────────────────────────────────────

  it('should POST to create a goal and append it to allGoals.data', () => {
    const payload = { title: 'New Goal', targetHoursPerWeek: 5, progress: 0 };
    const created = mockGoal('g-new');

    service.createSubjectGoal(payload, 'sub1').subscribe();

    const req = httpMock.expectOne(`${BASE}/goal/create/sub1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);

    expect(service.allGoals.data()).toContainEqual(created);
  });

  it('should append a created goal to an existing list', () => {
    const existing = mockGoal('g1');
    // Pre-populate via loadAllGoals
    service.loadAllGoals('sub1').subscribe();
    httpMock.expectOne(`${BASE}/goal/all/sub1`).flush([existing]);

    const created = mockGoal('g2');
    service.createSubjectGoal({ title: 'g2', targetHoursPerWeek: 2, progress: 0 }, 'sub1').subscribe();
    httpMock.expectOne(`${BASE}/goal/create/sub1`).flush(created);

    expect(service.allGoals.data()).toEqual([existing, created]);
  });

  // ─── updateGoal ───────────────────────────────────────────────────────────

  it('should PATCH to update a goal and replace it in allGoals.data', () => {
    const original = mockGoal('g1');
    service.loadAllGoals('sub1').subscribe();
    httpMock.expectOne(`${BASE}/goal/all/sub1`).flush([original]);

    const updated: Goal = { ...original, title: 'Updated' };
    service.updateGoal('g1', { title: 'Updated' }).subscribe();

    const req = httpMock.expectOne(`${BASE}/goal/update/g1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updated);

    expect(service.allGoals.data()).toEqual([updated]);
  });

  // ─── deleteGoal ───────────────────────────────────────────────────────────

  it('should DELETE a goal and remove it from allGoals.data', () => {
    const g1 = mockGoal('g1');
    const g2 = mockGoal('g2');
    service.loadAllGoals('sub1').subscribe();
    httpMock.expectOne(`${BASE}/goal/all/sub1`).flush([g1, g2]);

    service.deleteGoal('g1').subscribe();
    const req = httpMock.expectOne(`${BASE}/goal/delete/g1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.allGoals.data()).toEqual([g2]);
  });

  // ─── createGoalTask ───────────────────────────────────────────────────────

  it('should POST to create a task and append it to allTasks.data', () => {
    const payload = { title: 'Task 1', description: 'Desc', status: 'PENDING' as const };
    const created = mockTask('t-new');

    service.createGoalTask(payload, 'g1').subscribe();

    const req = httpMock.expectOne(`${BASE}/task/create/g1`);
    expect(req.request.method).toBe('POST');
    req.flush(created);

    expect(service.allTasks.data()).toContainEqual(created);
  });

  // ─── updateTask ───────────────────────────────────────────────────────────

  it('should PATCH to update a task and replace it in allTasks.data', () => {
    const t1 = mockTask('t1');
    service.loadAllTasks('g1').subscribe();
    httpMock.expectOne(`${BASE}/task/all/g1`).flush([t1]);

    const updated: Task = { ...t1, status: 'COMPLETED' };
    service.updateTask('t1', { status: 'COMPLETED' }).subscribe();

    const req = httpMock.expectOne(`${BASE}/task/update/t1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updated);

    expect(service.allTasks.data()).toEqual([updated]);
  });

  // ─── deleteTask ───────────────────────────────────────────────────────────

  it('should DELETE a task and remove it from allTasks.data', () => {
    const t1 = mockTask('t1');
    const t2 = mockTask('t2');
    service.loadAllTasks('g1').subscribe();
    httpMock.expectOne(`${BASE}/task/all/g1`).flush([t1, t2]);

    service.deleteTask('t1').subscribe();
    const req = httpMock.expectOne(`${BASE}/task/delete/t1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.allTasks.data()).toEqual([t2]);
  });
});
