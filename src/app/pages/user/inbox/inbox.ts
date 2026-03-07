import { Component } from '@angular/core';

@Component({
  selector: 'app-inbox',
  template: `
    <div class="flex h-full flex-col items-center justify-center gap-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <p>INBOX</p>
      </div>
      <div class="text-center">
        <h2 class="text-lg font-semibold">No messages</h2>
        <p class="text-sm text-muted-foreground">You have no messages in your inbox.</p>
      </div>
    </div>
  `,
})
export class Inbox {}
