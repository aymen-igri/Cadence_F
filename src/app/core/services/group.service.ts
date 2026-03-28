import { Injectable, signal, computed } from '@angular/core';
import { Group, GroupMembership } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private currentUserId = 'user-1'; // Mock user

  private _groups = signal<Group[]>([
    { id: 'g1', name: 'Angular Lovers', description: 'Discussing Angular 21+', type: 'OPEN' },
    { id: 'g2', name: 'Secret Club', description: 'Top secret discussions', type: 'LOCKED' },
    { id: 'g3', name: 'TypeScript Fanatics', description: 'All about types', type: 'OPEN' },
  ]);

  private _memberships = signal<GroupMembership[]>([
    { id: 'm1', groupId: 'g1', userId: 'user-1', role: 'ADMIN', joinedAt: new Date() },
  ]);

  public allGroups = this._groups.asReadonly();
  public myMemberships = computed(() =>
    this._memberships().filter((m) => m.userId === this.currentUserId),
  );

  public myGroups = computed(() => {
    const mems = this.myMemberships();
    const allMems = this._memberships();
    return this._groups()
      .filter((g) => mems.some((m) => m.groupId === g.id))
      .map((group) => {
        const membership = mems.find((m) => m.groupId === group.id);
        const memberCount = allMems.filter((m) => m.groupId === group.id).length;
        return { group, role: membership?.role, memberCount };
      });
  });

  public discoverGroups = computed(() => {
    const mems = this.myMemberships();
    const allMems = this._memberships();
    return this._groups()
      .filter((g) => !mems.some((m) => m.groupId === g.id))
      .map((group) => {
        const memberCount = allMems.filter((m) => m.groupId === group.id).length;
        return { group, memberCount };
      });
  });

  public createGroup(name: string, description: string, type: 'OPEN' | 'LOCKED') {
    const newGroup: Group = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      description,
      type,
    };

    const newMembership: GroupMembership = {
      id: Math.random().toString(36).substring(2, 9),
      groupId: newGroup.id,
      userId: this.currentUserId,
      role: 'ADMIN',
      joinedAt: new Date(),
    };

    this._groups.update((g) => [...g, newGroup]);
    this._memberships.update((m) => [...m, newMembership]);
  }

  public joinGroup(groupId: string) {
    const newMembership: GroupMembership = {
      id: Math.random().toString(36).substring(2, 9),
      groupId,
      userId: this.currentUserId,
      role: 'MEMBER',
      joinedAt: new Date(),
    };
    this._memberships.update((m) => [...m, newMembership]);
  }

  public requestToJoin(groupId: string) {
    console.log(`Requested to join group ${groupId}`);
    // Handle pending invitations/requests here
  }
}
