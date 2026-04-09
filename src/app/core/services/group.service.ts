import { Injectable, signal, computed, inject, linkedSignal } from '@angular/core';
import {
  Group,
  GroupMembership,
  SharedSession,
  Comment,
  GroupJoinRequest,
  FeedSharedSession,
  MemberItem,
  RequestItem,
  GroupCreateRequest,
  GroupResponse,
  Member,
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
    if (!this.authService.isReady() || !this.authService.currentUser() || !this.groupId())
      return undefined;
    return {
      url: `${this.url}/${this.groupId()}/members`,
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

  readonly isGroupsLoading = computed(() => this.allGroupsResource.isLoading());
  readonly isMembersLoading = computed(() => this.groupMembersResource.isLoading());

  public myGroups = computed(() => {
    return this.allGroupsData()
      .filter((g) => g.userRole != null)
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
    const userId = this.requireCurrentUserId();
    return this.http.post<GroupResponse>(`${this.url}/create`, payload).pipe(
      tap((response) => {
        this._groups.update((groups) => [...groups, response]);

        this._memberships.update((memberships) => [
          ...memberships,
          {
            id: response.membershipId,
            groupId: response.id,
            userId: userId,
            role: 'OWNER',
            joinedAt: new Date(),
          },
        ]);
      }),
    );
  }

  public joinGroup(groupId: string) {
    return this.http.post<Member>(`${this.url}/${groupId}/join`, {});
  }

  private _groups = signal<Group[]>([
    {
      id: 'g1',
      name: 'Angular Lovers',
      description: 'Discussing Angular 21+',
      privacyLevel: 'PUBLIC',
    },
    {
      id: 'g2',
      name: 'Secret Club',
      description: 'Top secret discussions',
      privacyLevel: 'PRIVATE',
    },
    {
      id: 'g3',
      name: 'TypeScript Fanatics',
      description: 'All about types',
      privacyLevel: 'PUBLIC',
    },
  ]);

  private _memberships = signal<GroupMembership[]>([
    { id: 'm1', groupId: 'g1', userId: 'user-1', role: 'ADMIN', joinedAt: new Date() },
    {
      id: 'm2',
      groupId: 'g1',
      userId: 'user-2',
      role: 'MEMBER',
      joinedAt: new Date(Date.now() - 86400000),
    },
  ]);

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

  private _joinRequests = signal<GroupJoinRequest[]>([
    { id: 'r1', groupId: 'g2', userId: 'user-3', requestedAt: new Date() },
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

  public allGroups = this._groups.asReadonly();
  public myMemberships = computed(() =>
    this._memberships().filter((m) => m.userId === this.currentUserId()),
  );

  public requestToJoin(groupId: string) {
    console.log(`Requested to join group ${groupId}`);
    const req: GroupJoinRequest = {
      id: Math.random().toString(36).substring(2, 9),
      groupId,
      userId: this.requireCurrentUserId(),
      requestedAt: new Date(),
    };
    this._joinRequests.update((r) => [...r, req]);
  }

  // --- Group Detail Additions ---

  public getGroupById(id: string): GroupResponse | undefined {
    return this.allGroupsData().find((g) => g.id === id);
  }

  public getMyRole(groupId: string) {
    return computed(() => {
      const mem = this._memberships().find(
        (m) => m.groupId === groupId && m.userId === this.currentUserId(),
      );
      return mem ? mem.role : null;
    });
  }

  public leaveGroup(groupId: string) {
    this._memberships.update((mems) =>
      mems.filter((m) => !(m.groupId === groupId && m.userId === this.currentUserId())),
    );
  }

  public getGroupMembers(groupId: string) {
    return computed<MemberItem[]>(() => {
      return this._memberships()
        .filter((m) => m.groupId === groupId)
        .map((m) => {
          const u = this._mockUsers[m.userId] || { initials: '?', name: 'Unknown' };
          return {
            membershipId: m.id,
            userId: m.userId,
            userInitials: u.initials,
            fullName: u.name,
            role: m.role,
            joinedAt: m.joinedAt,
          };
        });
    });
  }

  public getGroupRequests(groupId: string) {
    return computed<RequestItem[]>(() => {
      return this._joinRequests()
        .filter((r) => r.groupId === groupId)
        .map((r) => {
          const u = this._mockUsers[r.userId] || { initials: '?', name: 'Unknown' };
          return {
            requestId: r.id,
            userId: r.userId,
            userInitials: u.initials,
            fullName: u.name,
            requestedAt: r.requestedAt,
          };
        });
    });
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

  public updateRole(membershipId: string, newRole: 'MEMBER' | 'ADMIN') {
    this._memberships.update((mems) =>
      mems.map((m) => (m.id === membershipId ? { ...m, role: newRole } : m)),
    );
  }

  public removeMember(membershipId: string) {
    this._memberships.update((mems) => mems.filter((m) => m.id !== membershipId));
  }

  public acceptRequest(requestId: string) {
    const req = this._joinRequests().find((r) => r.id === requestId);
    if (req) {
      // Add member
      const newMembership: GroupMembership = {
        id: Math.random().toString(36).substring(2, 9),
        groupId: req.groupId,
        userId: req.userId,
        role: 'MEMBER',
        joinedAt: new Date(),
      };
      this._memberships.update((m) => [...m, newMembership]);
      // Remove request
      this._joinRequests.update((requests) => requests.filter((r) => r.id !== requestId));
    }
  }

  public declineRequest(requestId: string) {
    this._joinRequests.update((requests) => requests.filter((r) => r.id !== requestId));
  }

  public updateGroup(
    groupId: string,
    data: Partial<Pick<Group, 'name' | 'description' | 'privacyLevel'>>,
  ) {
    this._groups.update((groups) => groups.map((g) => (g.id === groupId ? { ...g, ...data } : g)));
  }

  public deleteGroup(groupId: string) {
    this._groups.update((groups) => groups.filter((g) => g.id !== groupId));
    this._memberships.update((mems) => mems.filter((m) => m.groupId !== groupId));
  }

  public setGroupId(id: string) {
    this.groupId.set(id);
  }
}
