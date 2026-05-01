import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plan-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './plan-header.html',
})
export class PlanHeaderComponent {
  mode = input<'create' | 'view' | 'edit'>('create');

  title = input<string>('');
  status = input<'ACTIVE' | 'DISABLED'>('ACTIVE');

  localTitle = '';
  localStatus: 'ACTIVE' | 'DISABLED' = 'ACTIVE';

  configChanged = output<{ title: string; status: 'ACTIVE' | 'DISABLED' }>();

  constructor() {
    effect(() => {
      this.localTitle = this.title();
      this.localStatus = this.status();
    });
  }

  toggleStatus() {
    if (this.mode() === 'view') return;
    this.localStatus = this.localStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    this.emitChange();
  }

  onTitleChange() {
    this.emitChange();
  }

  emitChange() {
    this.configChanged.emit({ title: this.localTitle?.trim() || '', status: this.localStatus });
  }
}
