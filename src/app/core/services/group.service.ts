import { Injectable, signal, computed, inject, linkedSignal } from '@angular/core';
import {
  SharedSession,
  Comment,
  FeedSharedSession,
  GroupCreateRequest,
  GroupResponse,
  Member,
  GroupUpdateRequest,
} from '../models/group.model';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { tap } from 'rxjs';
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

  readonly allGroupsResource = httpResource<GroupResponse[]>(() => {
    if (!this.authService.isReady() || !this.authService.currentUser()) return undefined;
    return {
      url: `${this.url}/all`,
      method: 'GET',
    };
  });

  readonly groupMembersResource = httpResource<Member[]>(() => {
    const id = this.groupId();
    if (!this.authService.isReady() || !this.authService.currentUser() || !id) return undefined;
    return {
      url: `${this.url}/${id}/members`,
      method: 'GET',
    };
  });

  readonly joinGroupRequestsResource = httpResource<Member[]>(() => {
    const id = this.groupId();
    if (!id || !this.authService.currentUser()) return undefined;
    return {
      url: `${this.url}/${id}/requests`,
      method: 'GET',
    };
  });

  readonly allGroupsData = linkedSignal<GroupResponse[], GroupResponse[]>({
    source: () => (this.allGroupsResource.hasValue() ? this.allGroupsResource.value() : []),
    computation: (value) => value,
  });

  readonly groupMembers = linkedSignal<Member[], Member[]>({
    source: () => (this.groupMembersResource.hasValue() ? this.groupMembersResource.value() : []),
    computation: (value) => value,
  });

  readonly joinRequests = linkedSignal<Member[], Member[]>({
    source: () =>
      this.joinGroupRequestsResource.hasValue() ? this.joinGroupRequestsResource.value() : [],
    computation: (value) => value,
  });

  readonly isGroupsLoading = computed(() => this.allGroupsResource.isLoading());
  readonly isMembersLoading = computed(() => this.groupMembersResource.isLoading());
  readonly isjoinRequestsLoading = computed(() => this.joinGroupRequestsResource.isLoading());

  public myGroups = computed(() => {
    return this.allGroupsData()
      .filter((g) => {
        return g.userRole != null && g.membershipStatus === 'APPROVED';
      })
      .map((g) => ({
        group: g,
        userRole: g.userRole,
        memberCount: g.membersCount,
      }));
  });

  public discoverGroups = computed(() => {
    return this.allGroupsData()
      .filter((g) => g.userRole == null)
      .map((g) => ({
        group: g,
        memberCount: g.membersCount,
      }));
  });

  public createGroup(payload: GroupCreateRequest) {
    return this.http.post<GroupResponse>(`${this.url}/create`, payload).pipe(
      tap((response) => {
        this.allGroupsData.update((groups) => [...groups, response]);
      }),
    );
  }

  public updateGroup(groupId: string, payload: GroupUpdateRequest) {
    return this.http.patch<GroupResponse>(`${this.url}/${groupId}`, payload).pipe(
      tap((response) => {
        this.allGroupsData.update((groups) =>
          groups.map((g) => (g.id === groupId ? response : g))
        );
      }),
    );
  }

  public transferOwnership(newOwnerId: string) {
    return this.http.patch(`${this.url}/${this.groupId()}/transfer/${newOwnerId}`, {});
  }

  public deleteGroup(groupId: string) {
    return this.http.delete(`${this.url}/${groupId}`).pipe(
      tap(() => {
        this.allGroupsData.update((groups) => groups.filter((g) => g.id !== groupId));
      }),
    );
  }

  public joinGroup(groupId: string) {
    return this.http.post<Member>(`${this.url}/${groupId}/join`, {});
  }

  public acceptJoinRequest(groupId: string, userId: string) {
    return this.http.patch<Member>(`${this.url}/${groupId}/requests/${userId}/approve`, {}).pipe(
      tap((newMember) => {
        this.joinRequests.update((r) => r.filter((req) => req.userId !== userId));
        this.groupMembers.update((m) => [...m, newMember]);
      })
    );
  }

  public declineJoinRequest(groupId: string, userId: string) {
    return this.http.delete(`${this.url}/${groupId}/requests/${userId}/reject`, {}).pipe(
      tap(() => {
        this.joinRequests.update((r) => r.filter((req) => req.userId !== userId));
      })
    );
  }

  public leaveGroup(groupId: string) {
    return this.http.delete(`${this.url}/${groupId}/leave`, {});
  }

  public promoteMember(groupId: string, targetMemberId: string) {
    return this.http.patch(`${this.url}/${groupId}/members/${targetMemberId}/promote`, {}).pipe(
      tap(() => {
        this.groupMembers.update((members) => {
          return members.map((m) => {
            return m.membershipId === targetMemberId ? { ...m, role: 'ADMIN' } : m;
          })
        })
      })
    );
  }

  public demoteMember(groupId: string, targetMemberId: string) {
    return this.http.patch(`${this.url}/${groupId}/members/${targetMemberId}/demote`, {}).pipe(
      tap(() => {
        this.groupMembers.update((members) => {
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
        this.groupMembers.update((members) => {
          return members.filter((m) => m.membershipId !== targetMemberId);
        });
      })
    );
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

  private requireCurrentUserId(): string {
    const userId = this.currentUserId();

    if (userId === null || userId === undefined) {
      throw new Error('Current user is not loaded or not authenticated.');
    }

    return userId;
  }

  // --- Group Detail Additions ---

  public getGroupById(id: string): GroupResponse | undefined {
    return this.allGroupsData().find((g) => g.id === id);
  }

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
