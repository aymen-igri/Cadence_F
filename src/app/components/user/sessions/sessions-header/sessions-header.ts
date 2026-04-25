import { Component, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, Plus, Calendar, List } from 'lucide-angular';
import { SessionDialogComponent } from "../session-dialog/session-dialog";

@Component({
  selector: 'app-sessions-header',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, LucideAngularModule, SessionDialogComponent],
  templateUrl: './sessions-header.html',
})
export class SessionsHeaderComponent {
  viewMode = input<'calendar' | 'list'>('list');
  viewModeChange = output<'calendar' | 'list'>();
  createSessionDialogState = signal<'closed' | 'open'>('closed');

  protected CalendarIcon = Calendar;
  protected ListIcon = List;
  protected Plus = Plus;
}
