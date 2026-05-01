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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { finalize, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { createQuery } from '../utils/query.helper';

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
  readonly allGroups = createQuery<GroupResponse[]>([]);
  readonly groupMembers = createQuery<Member[]>([]);
  readonly currentGroup = createQuery<GroupResponse | null>(null);
  readonly joinRequests = createQuery<JoinRequestResponse[]>([]);

  public myGroups = computed(() => {
    const groups = this.allGroups.data();
    return groups.filter((g) => g.userRole != null);
  });

  public discoverGroups = computed(() => {
    const groups = this.allGroups.data();
    return groups.filter((g) => g.userRole == null);
  });

  public loadJoinRequests(groupId: string) {
    return this.joinRequests.load(
      this.http.get<JoinRequestResponse[]>(`${this.url}/${groupId}/requests`),
    );
  }

  public getGroupDataById(groupId: string) {
    return this.currentGroup.load(this.http.get<GroupResponse>(`${this.url}/${groupId}`));
  }

  public loadAllGroups() {
    return this.allGroups.load(this.http.get<GroupResponse[]>(`${this.url}/all`));
  }

  public loadGroupMembers(groupId: string) {
    return this.groupMembers.load(this.http.get<Member[]>(`${this.url}/${groupId}/members`));
  }

  public createGroup(payload: GroupCreateRequest) {
    return this.http.post<GroupResponse>(`${this.url}/create`, payload).pipe(
      tap((response) => {
        this.allGroups.mutate((groups) => [...groups, response]);
      }),
    );
  }

  public updateGroup(groupId: string, payload: GroupUpdateRequest) {
    return this.http.patch<GroupResponse>(`${this.url}/${groupId}`, payload).pipe(
      tap((response) => {
        this.allGroups.mutate((groups) => groups.map((g) => (g.id === groupId ? response : g)));
      }),
    );
  }

  public transferOwnership(newOwnerId: string) {
    return this.http.patch(`${this.url}/${this.groupId()}/transfer/${newOwnerId}`, {}).pipe(
      tap(() => {
        const groupId = this.groupId();
        this.allGroups.mutate((groups) => {
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
        this.allGroups.mutate((groups) => groups.filter((g) => g.id !== groupId));
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
        this.groupMembers.mutate((m) => [...m, newMember]);
        this.joinRequests.mutate((r) => {
          return r.filter((m) => m.userId !== userId);
        });
      }),
    );
  }

  public declineJoinRequest(groupId: string, userId: string) {
    return this.http.delete(`${this.url}/${groupId}/requests/${userId}/reject`, {}).pipe(
      tap(() => {
        this.joinRequests.mutate((r) => r.filter((req) => req.userId !== userId));
      }),
    );
  }

  public leaveGroup(groupId: string) {
    return this.http.delete(`${this.url}/${groupId}/leave`, {});
  }

  public promoteMember(groupId: string, targetMemberId: string) {
    return this.http.patch(`${this.url}/${groupId}/members/${targetMemberId}/promote`, {}).pipe(
      tap(() => {
        this.groupMembers.mutate((members) => {
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
        this.groupMembers.mutate((members) => {
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
        this.groupMembers.mutate((members) => {
          return members.filter((m) => m.membershipId !== targetMemberId);
        });
      }),
    );
  }

  public getGroupById(id: string): GroupResponse | undefined {
    return this.allGroups.data().find((g) => g.id === id);
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
