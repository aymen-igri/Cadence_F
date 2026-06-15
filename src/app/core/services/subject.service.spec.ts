import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SubjectService } from './subject.service';
import { environment } from '../../environments/environment';
import { SubjectModel, SubjectPriority } from '../models/subject.model';

const BASE = `${environment.apiUrl}/subject`;

const mockSubject = (id = 's1'): SubjectModel => ({
  id,
  name: 'Mathematics',
  description: 'Core maths',
  priority: SubjectPriority.HIGH,
  createdAt: new Date('2024-01-01'),
});

describe('SubjectService', () => {
  let service: SubjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubjectService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SubjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── loadAllSubjects ──────────────────────────────────────────────────────

  it('should GET all subjects and populate allSubjects.data', () => {
    const subjects = [mockSubject('s1'), mockSubject('s2')];

    service.loadAllSubjects().subscribe();

    const req = httpMock.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush(subjects);

    expect(service.allSubjects.data()).toEqual(subjects);
  });

  it('should set allSubjects.isLoading to false after loadAllSubjects completes', () => {
    service.loadAllSubjects().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([]);

    expect(service.allSubjects.isLoading()).toBe(false);
  });

  it('should deduplicate concurrent loadAllSubjects requests (shareReplay)', () => {
    service.loadAllSubjects().subscribe();
    service.loadAllSubjects().subscribe();
    service.loadAllSubjects().subscribe();

    // Only one HTTP request should be made
    const reqs = httpMock.match(`${BASE}/all`);
    expect(reqs.length).toBe(1);
    reqs[0].flush([]);
  });

  // ─── createSubject ────────────────────────────────────────────────────────

  it('should POST to create a subject and append it to allSubjects.data', () => {
    const payload = { name: 'Physics', description: 'Physics basics', priority: SubjectPriority.MEDIUM };
    const created = mockSubject('s-new');

    service.createSubject(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);

    expect(service.allSubjects.data()).toContainEqual(created);
  });

  it('should append a created subject to an existing list', () => {
    const existing = mockSubject('s1');
    service.loadAllSubjects().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([existing]);

    const created = mockSubject('s2');
    service.createSubject({ name: 'Chemistry', description: '', priority: SubjectPriority.LOW }).subscribe();
    httpMock.expectOne(`${BASE}/create`).flush(created);

    expect(service.allSubjects.data()).toEqual([existing, created]);
  });

  // ─── deleteSubject ────────────────────────────────────────────────────────

  it('should DELETE a subject and remove it from allSubjects.data', () => {
    const s1 = mockSubject('s1');
    const s2 = mockSubject('s2');
    service.loadAllSubjects().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([s1, s2]);

    service.deleteSubject('s1').subscribe();
    const req = httpMock.expectOne(`${BASE}/delete/s1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.allSubjects.data()).toEqual([s2]);
  });

  it('should not affect other subjects when a subject is deleted', () => {
    const s1 = mockSubject('s1');
    const s2 = mockSubject('s2');
    const s3 = mockSubject('s3');
    service.loadAllSubjects().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([s1, s2, s3]);

    service.deleteSubject('s2').subscribe();
    httpMock.expectOne(`${BASE}/delete/s2`).flush(null);

    expect(service.allSubjects.data()).toEqual([s1, s3]);
  });

  // ─── updateSubject ────────────────────────────────────────────────────────

  it('should PATCH to update a subject and replace it in allSubjects.data', () => {
    const original = mockSubject('s1');
    service.loadAllSubjects().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([original]);

    const updated: SubjectModel = { ...original, name: 'Advanced Maths' };
    service.updateSubject('s1', { name: 'Advanced Maths' }).subscribe();

    const req = httpMock.expectOne(`${BASE}/update/s1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Advanced Maths' });
    req.flush(updated);

    expect(service.allSubjects.data()).toEqual([updated]);
  });

  it('should only update the matching subject and leave others unchanged', () => {
    const s1 = mockSubject('s1');
    const s2 = mockSubject('s2');
    service.loadAllSubjects().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([s1, s2]);

    const updatedS1: SubjectModel = { ...s1, name: 'Updated S1' };
    service.updateSubject('s1', { name: 'Updated S1' }).subscribe();
    httpMock.expectOne(`${BASE}/update/s1`).flush(updatedS1);

    expect(service.allSubjects.data()).toEqual([updatedS1, s2]);
  });
});
