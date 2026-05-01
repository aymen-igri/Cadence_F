import { Component, input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Group, Member } from '../../../../core/models/group.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { GroupService } from '@app/core/services/group.service';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';
import { createMutation } from '@app/core/utils/mutation.helper';

@Component({
  selector: 'app-group-settings-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmDialogImports,
    BrnDialogImports,
  ],
  templateUrl: './group-settings-tab.html',
})
export class GroupSettingsTabComponent {
  group = input.required<Group>();
  members = input.required<Member[]>();
  currentUserId = input.required<string>();
  groupService = inject(GroupService);
  router = inject(Router);

  private fb = inject(FormBuilder);

  settingsForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    privacyLevel: ['PUBLIC'],
  });

  selectedMemberCtrl = new FormControl('');

  transferState = signal<'closed' | 'open'>('closed');
  deleteState = signal<'closed' | 'open'>('closed');

  constructor() {
    effect(() => {
      const g = this.group();
      if (g) {
        this.settingsForm.patchValue(
          {
            name: g.name,
            description: g.description,
            privacyLevel: g.privacyLevel,
          },
          { emitEvent: false },
        );
      }
    });
  }

  isChanged(): boolean {
    const g = this.group();
    if (!g || this.settingsForm.invalid) return false;
    const vals = this.settingsForm.value;
    return (
      vals.name !== g.name ||
      vals.description !== g.description ||
      vals.privacyLevel !== g.privacyLevel
    );
  }

  getChangedFields() {
    const g = this.group();
    const vals = this.settingsForm.value;

    const changed: any = {};

    if (vals.name !== g?.name) {
      changed.name = vals.name;
    }

    if (vals.description !== g?.description) {
      changed.description = vals.description;
    }

    if (vals.privacyLevel !== g?.privacyLevel) {
      changed.privacyLevel = vals.privacyLevel;
    }

    return changed;
  }

  readonly updateGroup = createMutation({
    mutationFn: (payload: any) => this.groupService.updateGroup(this.group().id, payload),
    onSuccess: () => {
      toast.success('Group updated successfully.');
    },
    onError: (err) => {
      toast.error('Failed to update group.', { description: err });
    },
  });

  saveSettings() {
    if (!this.isChanged() || this.settingsForm.invalid) return;
    const payload = this.getChangedFields();
    this.updateGroup.mutate(payload);
  }

  get otherMembers() {
    return signal(this.members().filter((m) => m.userId !== this.currentUserId()));
  }

  readonly deleteGroup = createMutation({
    mutationFn: () => this.groupService.deleteGroup(this.group().id),
    onSuccess: () => {
      toast.success('Group deleted successfully.');
      this.router.navigate(['/user/groups']);
    },
    onError: (err) => {
      toast.error('Failed to delete group.', { description: err });
    },
  });

  confirmDelete() {
    this.deleteGroup.mutate({});
    this.deleteState.set('closed');
  }

  readonly transferGroupOwnership = createMutation({
    mutationFn: (selectedId: string) => this.groupService.transferOwnership(selectedId),
    onSuccess: () => {
      toast.success('Ownership transferred successfully.');
      this.router.navigate(['/user/groups']);
    },
    onError: (err) => {
      toast.error('Failed to transfer ownership.', { description: err });
    },
  });

  transferOwnership() {
    const selectedId = this.selectedMemberCtrl.value;
    if (selectedId) {
      this.transferGroupOwnership.mutate(selectedId);
    }
    this.transferState.set('closed');
    this.selectedMemberCtrl.setValue('');
  }
}
