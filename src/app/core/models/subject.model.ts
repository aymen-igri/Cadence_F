export enum SubjectPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface SubjectData {
  subjectName: string;
  subjectDescription: string;
  subjectPriority: SubjectPriority;
}

export interface CreateSubjectRequest {
  name: string;
  description: string;
  priority: SubjectPriority;
}

export type UpdateSubjectRequest = Partial<CreateSubjectRequest>;

export interface SubjectModel {
  id: string;
  name: string;
  description: string;
  priority: SubjectPriority;
  createdAt: Date;
}
