import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plan-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './plan-header.html',
})
export class PlanHeaderComponent {
  title = '';
  status: 'ACTIVE' | 'DISABLED' = 'ACTIVE';

  configChanged = output<{ title: string; status: 'ACTIVE' | 'DISABLED' }>();

  toggleStatus() {
    this.status = this.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    this.emitChange();
  }

  emitChange() {
    this.configChanged.emit({ title: this.title?.trim() || '', status: this.status });
  }
}
