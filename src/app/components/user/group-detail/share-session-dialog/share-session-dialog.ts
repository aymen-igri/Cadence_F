import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-share-session-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmDialogImports,
    BrnDialogImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmInputImports,
  ],
  templateUrl: './share-session-dialog.html',
})
export class ShareSessionDialogComponent {
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();
  confirmClick = output<string>();

  selectedSessionId = signal('');

  closeDialog(ctx: any) {
    this.dialogStateChange.emit('closed');
    ctx.close();
  }

  confirm(ctx: any) {
    if (this.selectedSessionId()) {
      this.confirmClick.emit(this.selectedSessionId());
      this.selectedSessionId.set('');
      this.closeDialog(ctx);
    }
  }
}
