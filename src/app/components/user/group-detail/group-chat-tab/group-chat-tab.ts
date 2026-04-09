import {
  Component,
  input,
  signal,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { lucideSend, lucideAlertCircle } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { ChatService } from '@app/core/services/chat.service'; // adjust path if needed

@Component({
  selector: 'app-group-chat-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmButtonImports, HlmInputImports, HlmIconImports, DatePipe],
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
  isSending = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.initChat();
  }

  private initChat(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Load history first via REST
    this.chatService.loadChatHistory(this.groupId()).subscribe({
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

  ngAfterViewChecked(): void {
    this.scrollToBottom();
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
