import { Component, Input, Output, EventEmitter, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSession } from '../../../../core/models/session.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import {
  LucideAngularModule,
  Clock,
  FileText,
  CheckCircle2,
  PlayCircle,
  Goal,
} from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmBadgeImports, LucideAngularModule, HlmButtonImports],
  templateUrl: './sessions-list.html',
})
export class SessionsListComponent {
  sessions = input<AppSession[]>([]);
  sessionClick = output<string>();
  startSession = output<string>();
  completeSession = output<string>();

  protected Clock = Clock;
  protected FileText = FileText;
  protected CheckCircle2 = CheckCircle2;
  protected PlayCircle = PlayCircle;
  protected Goal = Goal;

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'COMPLETED':
        return 'default'; // Or custom valid variant
      case 'IN_PROGRESS':
        return 'secondary';
      case 'MISSED':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  onActionClick(event: Event, session: AppSession, action: 'start' | 'complete' | 'view') {
    event.stopPropagation(); // Prevent card click
    if (action === 'start') {
      this.startSession.emit(session.id);
    } else if (action === 'complete') {
      this.completeSession.emit(session.id);
    }
  }
}
