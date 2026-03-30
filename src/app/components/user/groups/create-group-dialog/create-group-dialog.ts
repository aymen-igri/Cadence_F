import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { GroupData } from '@app/core/models/group.model';
import { form, required, FormRoot, FormField } from '@angular/forms/signals';

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
  groupModel = signal<GroupData>({ name: '', description: '', type: 'OPEN' });

  groupForm = form(
    this.groupModel,
    (schema) => {
      required(schema.name, { message: 'Group name is required' });
      required(schema.description, { message: 'Group description is required' });
      required(schema.type, { message: 'Group type is required' });
    },
    {
      submission: {
        action: async () => {
          const data = this.groupModel();
          console.log('Submitted Group Data', data);
          this.dialogStateChange.emit('closed');
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
