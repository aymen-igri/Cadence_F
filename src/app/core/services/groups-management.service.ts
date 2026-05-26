import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type PrivacyLevel = 'PUBLIC' | 'PRIVATE';
export type MemberRole = 'OWNER' | 'MODERATOR' | 'MEMBER';

export interface GroupFilterRequest {
  name: string;
  privacyLevel: PrivacyLevel | '';
}

export interface GroupData {
  id: string;
  name: string;
  privacyLevel: PrivacyLevel;
}

export interface GroupsFilterPayload {
  groupData: GroupFilterRequest;
  page: number;
  size: number;
}

export interface JoinRequestData {
  pendingReq: number;
  acceptedReq: number;
  rejectedReq: number;
}

export interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
  joinedAt: string;
}

export interface MessageActivity {
  date: string;
  messageCount: number;
}

export interface GroupDetailsResponse {
  id: string;
  name: string;
  description: string;
  privacyLevel: PrivacyLevel;
  joinReqData: JoinRequestData;
  members: GroupMember[];
  messageActivity: MessageActivity[];
}

@Injectable({ providedIn: 'root' })
export class GroupsManagementService {
  private readonly apiUrl = `${environment.apiUrl}/admin/groups`;
  private http = inject(HttpClient);

  searchGroups(payload: GroupsFilterPayload) {
    return this.http.post<GroupData[]>(`${this.apiUrl}/tables/searchGroups`, payload);
  }

  getGroupDetails(groupId: string) {
    return this.http.get<GroupDetailsResponse>(`${this.apiUrl}/groupDetails?groupId=${groupId}`);
  }
}
