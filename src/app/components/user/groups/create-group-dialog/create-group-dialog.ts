import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';

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
  ],
  templateUrl: './create-group-dialog.html',
})
export class CreateGroupDialogComponent {
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();
  confirmClick = output<{ name: string; description: string; type: 'OPEN' | 'LOCKED' }>();

  groupName = signal('');
  description = signal('');
  type = signal<'OPEN' | 'LOCKED'>('OPEN');

  onStateChange(event: 'closed' | 'open') {
    this.dialogStateChange.emit(event);
  }

  closeDialog(ctx: any) {
    this.dialogStateChange.emit('closed');
    ctx.close();
  }

  confirm(ctx: any) {
    if (!this.groupName() || !this.description()) return;
    this.confirmClick.emit({
      name: this.groupName(),
      description: this.description(),
      type: this.type(),
    });
    this.groupName.set('');
    this.description.set('');
    this.type.set('OPEN');
    this.closeDialog(ctx);
  }
}
