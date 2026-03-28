export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'OPEN' | 'LOCKED';
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN';
  joinedAt: Date;
}
