import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { GroupData } from '@app/core/models/group.model';
import { form, required, FormRoot, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { GroupService } from '@app/core/services/group.service';
import { toast } from 'ngx-sonner';
import { extractErrorMessage } from '@app/core/utils/error.util';

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    BrnDialogImports,
    FormRoot,
    FormField,
  ],
  templateUrl: './create-group-dialog.html',
})
export class CreateGroupDialogComponent {
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();
  groupModel = signal<GroupData>({ name: '', description: '', privacyLevel: 'PUBLIC' });
  private groupService = inject(GroupService);

  groupForm = form(
    this.groupModel,
    (schema) => {
      required(schema.name, { message: 'Group name is required' });
      required(schema.description, { message: 'Group description is required' });
      required(schema.privacyLevel, { message: 'Group privacy level is required' });
    },
    {
      submission: {
        action: async () => {
          const payload = this.groupModel();
          try {
            await firstValueFrom(this.groupService.createGroup(payload));
            toast.success('Group created successfully!', {
              description: 'Your new group has been created.',
            });
            this.dialogStateChange.emit('closed');
          } catch (err: any) {
            const message = extractErrorMessage(err);
            toast.error('Group creation failed', {
              description: message,
            });
            throw err;
          }
        },
      },
    },
  );
  onStateChange(event: 'closed' | 'open') {
    this.dialogStateChange.emit(event);
  }

  closeDialog(ctx: any) {
    this.dialogStateChange.emit('closed');
    ctx.close();
  }
}
