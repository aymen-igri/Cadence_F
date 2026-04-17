import { Injectable, signal, computed, inject, linkedSignal } from '@angular/core';
import {
  SharedSession,
  Comment,
  FeedSharedSession,
  GroupCreateRequest,
  GroupResponse,
  Member,
  GroupUpdateRequest,
  JoinRequestResponse,
} from '../models/group.model';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { finalize, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  readonly currentUserId = computed<string | null | undefined>(() => {
    if (!this.authService.isReady()) return undefined;
    return this.authService.currentUser()?.id ?? null;
  });
  private readonly url = `${environment.apiUrl}/groups`;
  private groupId = signal<string | null>(null);
  private readonly _groupMembers = signal<Member[]>([]);
  readonly groupMembers = this._groupMembers.asReadonly();
  private readonly _isMembersLoading = signal(false);
  readonly isMembersLoading = this._isMembersLoading.asReadonly();
  private readonly _allGroupsData = signal<GroupResponse[]>([]);
  readonly allGroupsData = this._allGroupsData.asReadonly();
  private readonly _isGroupsLoading = signal(false);
  readonly isGroupsLoading = this._isGroupsLoading.asReadonly();
  private readonly _currentGroup = signal<GroupResponse | null>(null);
  readonly currentGroup = this._currentGroup.asReadonly();
  private readonly _isCurrentGroupLoading = signal(false);
  readonly isCurrentGroupLoading = this._isCurrentGroupLoading.asReadonly();
  private readonly _joinRequests = signal<JoinRequestResponse[]>([]);
  readonly joinRequests = this._joinRequests.asReadonly();
  private readonly _isJoinRequestsLoading = signal(false);
  readonly isJoinRequestsLoading = this._isJoinRequestsLoading.asReadonly();

  public myGroups = computed(() => {
    const groups = this.allGroupsData();
    return groups.filter((g) => g.userRole != null);
  });

  public discoverGroups = computed(() => {
    const groups = this.allGroupsData();
    return groups.filter((g) => g.userRole == null);
  });

  public loadJoinRequests(groupId: string) {
    this._isJoinRequestsLoading.set(true);
    return this.http.get<JoinRequestResponse[]>(`${this.url}/${groupId}/requests`).pipe(
      tap((requests) => {
        this._joinRequests.set(requests);
      }),
      finalize(() => this._isJoinRequestsLoading.set(false)),
    );
  }

  public getGroupDataById(groupId: string) {
    this._isCurrentGroupLoading.set(true);
    return this.http.get<GroupResponse>(`${this.url}/${groupId}`).pipe(
      tap((group) => {
        this._currentGroup.set(group);
      }),
      finalize(() => this._isCurrentGroupLoading.set(false)),
    );
  }

  public loadAllGroups() {
    this._isGroupsLoading.set(true);
    return this.http.get<GroupResponse[]>(`${this.url}/all`).pipe(
      tap((groups) => {
        this._allGroupsData.set(groups);
      }),
      finalize(() => this._isGroupsLoading.set(false)),
    );
  }

  public loadGroupMembers(groupId: string) {
    this._isMembersLoading.set(true);
    return this.http.get<Member[]>(`${this.url}/${groupId}/members`).pipe(
      tap((members) => {
        this._groupMembers.set(members);
      }),
      finalize(() => this._isMembersLoading.set(false)),
    );
  }

  public createGroup(payload: GroupCreateRequest) {
    return this.http.post<GroupResponse>(`${this.url}/create`, payload).pipe(
      tap((response) => {
        this._allGroupsData.update((groups) => [...groups, response]);
      }),
    );
  }

  public updateGroup(groupId: string, payload: GroupUpdateRequest) {
    return this.http.patch<GroupResponse>(`${this.url}/${groupId}`, payload).pipe(
      tap((response) => {
        this._allGroupsData.update((groups) =>
          groups.map((g) => (g.id === groupId ? response : g)),
        );
      }),
    );
  }

  public transferOwnership(newOwnerId: string) {
    return this.http.patch(`${this.url}/${this.groupId()}/transfer/${newOwnerId}`, {}).pipe(
      tap(() => {
        const groupId = this.groupId();
        this._allGroupsData.update((groups) => {
          return groups.map((group) => {
            if (group.id === groupId) {
              return { ...group, userRole: 'MEMBER' };
            }
            return group;
          });
        });
      }),
    );
  }

  public deleteGroup(groupId: string) {
    return this.http.delete(`${this.url}/${groupId}`).pipe(
      tap(() => {
        this._allGroupsData.update((groups) => groups.filter((g) => g.id !== groupId));
      }),
    );
  }

  public joinPublicGroup(groupId: string) {
    return this.http.post<Member>(`${this.url}/${groupId}/join`, {});
  }

  public requestJoin(groupId: string) {
    return this.http.post<JoinRequestResponse>(`${this.url}/${groupId}/join-request`, {});
  }

  public acceptJoinRequest(groupId: string, userId: string) {
    return this.http.patch<Member>(`${this.url}/${groupId}/requests/${userId}/approve`, {}).pipe(
      tap((newMember) => {
        this._groupMembers.update((m) => [...m, newMember]);
        this._joinRequests.update((r) => {
          return r.filter((m) => m.userId !== userId);
        });
      }),
    );
  }

  public declineJoinRequest(groupId: string, userId: string) {
    return this.http.delete(`${this.url}/${groupId}/requests/${userId}/reject`, {}).pipe(
      tap(() => {
        this._joinRequests.update((r) => r.filter((req) => req.userId !== userId));
      }),
    );
  }

  public leaveGroup(groupId: string) {
    return this.http.delete(`${this.url}/${groupId}/leave`, {});
  }

  public promoteMember(groupId: string, targetMemberId: string) {
    return this.http.patch(`${this.url}/${groupId}/members/${targetMemberId}/promote`, {}).pipe(
      tap(() => {
        this._groupMembers.update((members) => {
          return members.map((m) => {
            return m.membershipId === targetMemberId ? { ...m, role: 'ADMIN' } : m;
          });
        });
      }),
    );
  }

  public demoteMember(groupId: string, targetMemberId: string) {
    return this.http.patch(`${this.url}/${groupId}/members/${targetMemberId}/demote`, {}).pipe(
      tap(() => {
        this._groupMembers.update((members) => {
          return members.map((m) => {
            return m.membershipId === targetMemberId ? { ...m, role: 'MEMBER' } : m;
          });
        });
      }),
    );
  }

  public removeMember(groupId: string, targetMemberId: string) {
    return this.http.delete(`${this.url}/${groupId}/members/${targetMemberId}`).pipe(
      tap(() => {
        this._groupMembers.update((members) => {
          return members.filter((m) => m.membershipId !== targetMemberId);
        });
      }),
    );
  }

  public getGroupById(id: string): GroupResponse | undefined {
    return this.allGroupsData().find((g) => g.id === id);
  }

  private requireCurrentUserId(): string {
    const userId = this.currentUserId();

    if (userId === null || userId === undefined) {
      throw new Error('Current user is not loaded or not authenticated.');
    }

    return userId;
  }

  private _sharedSessions = signal<SharedSession[]>([
    {
      id: 'ss1',
      sessionId: 'sess1',
      groupId: 'g1',
      sharedByUserId: 'user-2',
      sharedAt: new Date(Date.now() - 3600000),
    },
  ]);

  private _comments = signal<Comment[]>([
    {
      id: 'c1',
      sharedSessionId: 'ss1',
      userId: 'user-1',
      content: 'Great job!',
      createdAt: new Date(),
    },
  ]);

  // Mock static users dictionary for fast resolution
  private _mockUsers: Record<string, { initials: string; name: string }> = {
    'user-1': { initials: 'AM', name: 'Aymane M.' },
    'user-2': { initials: 'JD', name: 'John Doe' },
    'user-3': { initials: 'AR', name: 'Alice Ray' },
  };

  // --- Group Detail Additions ---

  public getGroupFeed(groupId: string) {
    return computed<FeedSharedSession[]>(() => {
      return this._sharedSessions()
        .filter((s) => s.groupId === groupId)
        .sort((a, b) => b.sharedAt.getTime() - a.sharedAt.getTime())
        .map((s) => {
          const u = this._mockUsers[s.sharedByUserId] || { initials: '?', name: 'Unknown' };
          const sessionComments = this._comments()
            .filter((c) => c.sharedSessionId === s.id)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((c) => {
              const cu = this._mockUsers[c.userId] || { initials: '?', name: 'Unknown' };
              return { ...c, userInitials: cu.initials, userName: cu.name };
            });

          return {
            ...s,
            userInitials: u.initials,
            userName: u.name,
            sessionTitle: 'Mock Session Title', // Real implementation would fetch this from session service
            goalName: 'Mock Goal',
            duration: 120, // 2 hours
            status: 'COMPLETED',
            comments: sessionComments,
          };
        });
    });
  }

  public shareSession(groupId: string, sessionId: string) {
    const newShare: SharedSession = {
      id: Math.random().toString(36).substring(2, 9),
      sessionId,
      groupId,
      sharedByUserId: this.requireCurrentUserId(),
      sharedAt: new Date(),
    };
    this._sharedSessions.update((s) => [newShare, ...s]);
  }

  public addComment(sharedSessionId: string, content: string) {
    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      sharedSessionId,
      userId: this.requireCurrentUserId(),
      content,
      createdAt: new Date(),
    };
    this._comments.update((c) => [...c, newComment]);
  }

  public setGroupId(id: string) {
    this.groupId.set(id);
  }
}
