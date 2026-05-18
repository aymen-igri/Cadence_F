export interface Group {
  id: string;
  name: string;
  description: string;
  privacyLevel: 'PUBLIC' | 'PRIVATE';

}

export interface GroupCreateRequest {
  name: string;
  description: string;
  privacyLevel: 'PUBLIC' | 'PRIVATE';
}

export interface GroupResponse {
  id: string;
  name: string;
  description: string;
  privacyLevel: 'PUBLIC' | 'PRIVATE';
  membersCount: number;
  membershipId: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER' | null;
  createdAt: Date;
}
export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  joinedAt: Date;
}

// Added for UI view model integration
export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  requestedAt: Date;
}

export interface MemberItem {
  membershipId: string;
  userId: string;
  userInitials: string;
  fullName: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  joinedAt: Date;
}

export interface RequestItem {
  requestId: string;
  userId: string;
  userInitials: string;
  fullName: string;
  requestedAt: Date;
}

export interface Member {
  membershipId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  joinedAt: Date;
}

export interface GroupUpdateRequest {
  name?: string;
  description?: string;
  privacyLevel?: 'PUBLIC' | 'PRIVATE';
}

export interface JoinRequestResponse {
  id: string;
  groupId: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  requestedAt: Date;
}

export type GroupData = Omit<Group, 'id'>