import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, Plus, Calendar, List } from 'lucide-angular';

@Component({
  selector: 'app-sessions-header',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, LucideAngularModule],
  templateUrl: './sessions-header.html',
})
export class SessionsHeaderComponent {
  viewMode = input<'calendar' | 'list'>('calendar');
  viewModeChange = output<'calendar' | 'list'>();
  addSession = output<void>();

  protected CalendarIcon = Calendar;
  protected ListIcon = List;
  protected Plus = Plus;
}
