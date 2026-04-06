import { Component, input, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-inbox-header',
  imports: [...HlmButtonImports],
  templateUrl: './inbox-header.html',
})
export class InboxHeader {
  unreadCount = input<number>(0);
  markAllAsRead = output<void>();

  onMarkAllAsRead() {
    this.markAllAsRead.emit();
  }
}
