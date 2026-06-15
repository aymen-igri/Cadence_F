import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { IMessage } from '@stomp/rx-stomp';
import { ChatService } from './chat.service';
import { WebSocketService } from './websocket.service';
import { environment } from '../../environments/environment';
import { GroupMessageResponse, PagedMessageResponse } from '../models/chat.model';

const BASE = `${environment.apiUrl}/groups`;

const mockMessage = (id = 'm1'): GroupMessageResponse => ({
  id,
  groupId: 'grp1',
  senderId: 'user1',
  groupName: 'Study Group',
  senderFirstName: 'Alice',
  senderLastName: 'Smith',
  content: 'Hello!',
  sentAt: '2024-01-01T10:00:00Z',
  senderProfilePic: null,
});

const mockPagedResponse = (
  messages: GroupMessageResponse[],
  page = 0,
  hasMore = false,
): PagedMessageResponse => ({
  messages,
  currentPage: page,
  totalElements: messages.length,
  totalPages: 1,
  hasMore,
});

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let wsSubject$: Subject<IMessage>;
  let mockWsService: { connect: ReturnType<typeof vi.fn>; watch: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    wsSubject$ = new Subject<IMessage>();

    mockWsService = {
      connect: vi.fn(),
      watch: vi.fn().mockReturnValue(wsSubject$.asObservable()),
    };

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: WebSocketService, useValue: mockWsService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.disconnect();
    httpMock.verify();
  });

  // ─── sendMessage ──────────────────────────────────────────────────────────

  it('should POST to send a message and return the response', () => {
    const expected = mockMessage('m1');

    service.sendMessage('grp1', 'Hello!').subscribe((msg) => {
      expect(msg).toEqual(expected);
    });

    const req = httpMock.expectOne(`${BASE}/grp1/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Hello!' });
    req.flush(expected);
  });

  it('should NOT directly push a sent message into the messages list', () => {
    service.sendMessage('grp1', 'Hello!').subscribe();
    httpMock.expectOne(`${BASE}/grp1/messages`).flush(mockMessage());

    // Message should NOT appear until the WebSocket bounces it back
    expect(service.messages()).toEqual([]);
  });

  // ─── loadPagedChatHistory ─────────────────────────────────────────────────

  it('should GET paginated history (page 0) and replace the messages list', () => {
    const messages = [mockMessage('m1'), mockMessage('m2')];
    const response = mockPagedResponse(messages, 0, true);

    service.loadPagedChatHistory('grp1', 0).subscribe();

    const req = httpMock.expectOne(`${BASE}/grp1/messages/paginated?page=0&size=20`);
    expect(req.request.method).toBe('GET');
    req.flush(response);

    expect(service.messages()).toEqual(messages);
    expect(service.hasMore()).toBe(true);
    expect(service.currentPage()).toBe(0);
  });

  it('should prepend older messages when loading page > 0 (infinite scroll)', () => {
    // Load page 0 first
    const page0Messages = [mockMessage('m3'), mockMessage('m4')];
    service.loadPagedChatHistory('grp1', 0).subscribe();
    httpMock.expectOne(`${BASE}/grp1/messages/paginated?page=0&size=20`).flush(
      mockPagedResponse(page0Messages, 0, true),
    );

    // Load page 1 (older messages)
    const page1Messages = [mockMessage('m1'), mockMessage('m2')];
    service.loadPagedChatHistory('grp1', 1).subscribe();
    httpMock.expectOne(`${BASE}/grp1/messages/paginated?page=1&size=20`).flush(
      mockPagedResponse(page1Messages, 1, false),
    );

    // Older messages should be prepended (page 1 messages at the front)
    expect(service.messages()).toEqual([...page1Messages, ...page0Messages]);
    expect(service.hasMore()).toBe(false);
    expect(service.currentPage()).toBe(1);
  });

  it('should use a custom page size when provided', () => {
    service.loadPagedChatHistory('grp1', 0, 50).subscribe();

    const req = httpMock.expectOne(`${BASE}/grp1/messages/paginated?page=0&size=50`);
    req.flush(mockPagedResponse([], 0));
  });

  // ─── connectAndSubscribe ──────────────────────────────────────────────────

  it('should call wsService.connect and watch the correct topic when connectAndSubscribe is called', () => {
    service.connectAndSubscribe('grp1');

    expect(mockWsService.connect).toHaveBeenCalledOnce();
    expect(mockWsService.watch).toHaveBeenCalledWith('/topic/groups/grp1');
  });

  // ─── WebSocket incoming message handling ──────────────────────────────────

  it('should append an incoming WebSocket message to the messages list', () => {
    service.connectAndSubscribe('grp1');

    const incomingMsg = mockMessage('m-ws');
    wsSubject$.next({ body: JSON.stringify(incomingMsg) } as IMessage);

    expect(service.messages()).toContainEqual(incomingMsg);
  });

  it('should not duplicate a message that already exists in the list', () => {
    service.connectAndSubscribe('grp1');

    const incomingMsg = mockMessage('m-ws');
    wsSubject$.next({ body: JSON.stringify(incomingMsg) } as IMessage);
    wsSubject$.next({ body: JSON.stringify(incomingMsg) } as IMessage);

    expect(service.messages().filter((m) => m.id === 'm-ws').length).toBe(1);
  });

  it('should ignore WebSocket messages with an empty body', () => {
    service.connectAndSubscribe('grp1');

    wsSubject$.next({ body: '' } as IMessage);

    expect(service.messages()).toEqual([]);
  });

  // ─── disconnect ───────────────────────────────────────────────────────────

  it('should clear all state when disconnect is called', () => {
    // Populate state
    service.loadPagedChatHistory('grp1', 0).subscribe();
    httpMock
      .expectOne(`${BASE}/grp1/messages/paginated?page=0&size=20`)
      .flush(mockPagedResponse([mockMessage()], 0, true));

    service.disconnect();

    expect(service.messages()).toEqual([]);
    expect(service.currentPage()).toBe(0);
    expect(service.hasMore()).toBe(false);
  });
});
