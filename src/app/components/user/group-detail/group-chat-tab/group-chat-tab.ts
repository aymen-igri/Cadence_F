import {
  Component,
  input,
  signal,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { lucideSend, lucideAlertCircle } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { ChatService } from '@app/core/services/chat.service';
import { LoadingSpinnerComponent } from '@app/components/shared/loading-spinner/loading-spinner.component';
import { effect } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-group-chat-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButtonImports, HlmInputImports, HlmIconImports, DatePipe, LoadingSpinnerComponent],
  providers: [provideIcons({ lucideSend, lucideAlertCircle })],
  templateUrl: './group-chat-tab.html',
})
export class GroupChatTabComponent implements OnInit, OnDestroy {
  currentUserId = input.required<string>();
  groupId = input.required<string>();

  private chatService = inject(ChatService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // 1. Link to the service's reactive signal directly
  messages = this.chatService.messages;

  // 2. Local UI State signals
  newMessage = signal('');
  isLoading = signal(true);
  isLoadingOlder = signal(false);
  isSending = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      // Whenever messages change, if we're not explicitly loading older ones,
      // scroll to the bottom to show the newest messages.
      this.messages();
      if (!this.isLoadingOlder() && !this.isLoading()) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  ngOnInit(): void {
    this.initChat();
  }

  private initChat(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Load history first via REST
    this.chatService.loadPagedChatHistory(this.groupId(), 0, 20).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Once history is loaded, connect WebSocket to listen for new messages
        this.chatService.connectAndSubscribe(this.groupId());
      },
      error: (err) => {
        console.error('Failed to load chat history', err);
        this.error.set('Could not load chat history. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  sendMessage(): void {
    const content = this.newMessage().trim();
    if (!content || this.isSending()) return;

    this.isSending.set(true);
    this.error.set(null);

    this.chatService.sendMessage(this.groupId(), content).subscribe({
      next: () => {
        // Success: Clear the input.
        // We don't add the message to the list manually here; the WebSocket will bounce it back safely.
        this.newMessage.set('');
        this.isSending.set(false);
      },
      error: (err) => {
        console.error('Failed to send message', err);
        this.error.set('Failed to send message. Please ensure you are connected.');
        this.isSending.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    // CRITICAL: Clean up WebSocket and subscriptions when the user clicks away from the tab
    this.chatService.disconnect();
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.scrollTop === 0 && this.chatService.hasMore() && !this.isLoadingOlder()) {
      this.loadOlderMessages();
    }
  }

  private loadOlderMessages(): void {
    this.isLoadingOlder.set(true);
    const oldScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
    
    this.chatService.loadPagedChatHistory(this.groupId(), this.chatService.currentPage() + 1, 20).subscribe({
      next: () => {
        // Restore scroll position so user doesn't jump to the top
        setTimeout(() => {
          const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
          this.scrollContainer.nativeElement.scrollTop = newScrollHeight - oldScrollHeight;
          this.isLoadingOlder.set(false);
        }, 0);
      },
      error: (err) => {
        console.error('Failed to load older messages', err);
        this.isLoadingOlder.set(false);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }
}
