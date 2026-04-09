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
  membershipStatus: 'APPROVED' | 'PENDING' | null;
  createdAt: Date;
}
export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  joinedAt: Date;
}

export interface SharedSession {
  id: string;
  sessionId: string;
  groupId: string;
  sharedByUserId: string;
  sharedAt: Date;
}

export interface Comment {
  id: string;
  sharedSessionId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// Added for UI view model integration
export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  requestedAt: Date;
}

export interface FeedComment extends Comment {
  userInitials: string;
  userName: string;
}

export interface FeedSharedSession extends SharedSession {
  userInitials: string;
  userName: string;
  sessionTitle: string;
  goalName: string;
  duration: number;
  status: string;
  comments: FeedComment[];
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


export type GroupData = Omit<Group, 'id'>