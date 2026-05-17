🔍 Angular Project Diagnosis Report

Based on my analysis of your Angular 21 project, here are the key findings
regarding bad practices, API handling, and optimization concerns:

---

✅ GOOD PRACTICES (What you're doing right)

1. Modern Angular patterns: Using Angular 21 with signals, inject(),
standalone components
2. Functional interceptors: Using HttpInterceptorFn (modern approach)
3. Signal-based state management: Good use of signals for reactivity
4. Custom query helper: createQuery<T>() provides a clean abstraction for
loading states
5. Token refresh logic: Auth interceptor handles 401s and refreshes tokens
automatically
6. HTTP caching: Custom cache interceptor with TTL support

---

⚠️ CRITICAL ISSUES

1. Memory Leaks - Unmanaged Subscriptions 🚨
- 47 .subscribe() calls found across the codebase
- Only 4 files use takeUntil or DestroyRef for cleanup
- Most components don't clean up subscriptions

Problem locations:
// ❌ BAD: weekly-plan.ts:32
ngOnInit() {
this.sessionService.loadAllGeneratedSessions().subscribe();
}

// ❌ BAD: settings-change-password.ts:112-124
this.mfaService.triggerEmailCodeForPasswordChange()
.pipe(finalize(() => this.isSendingOtp.set(false)))
.subscribe({ ... }); // No cleanup!

// ❌ BAD: inbox.ts:39-47
this.notificationService.markAsRead(id).subscribe({ ... }); // No cleanup!

Impact: Memory leaks on every component navigation

1. Loading State Race Conditions 🚨

File: loading.interceptor.ts

// ❌ CRITICAL BUG
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
loadingService.show();
return next(req).pipe(finalize(() => loadingService.hide()));
};

Problem: With multiple simultaneous requests:

1. Request A starts → show()
2. Request B starts → show() (still showing)
3. Request A finishes → hide() ❌ Hides loader while B is still loading!
4. Request B finishes → hide() (already hidden)

Result: Flickering loaders, incorrect loading states

1. Cache Invalidation Issues ⚠️

File: cache.interceptor.ts:16

// ❌ FLAWED: Only invalidates by pathname
cacheService.invalidate(new URL(req.url).pathname);

Problems:

- POST /groups/123/messages invalidates /groups/123/messages
- But cached GET /groups/123/messages still exists (different query params)
- Stale data served after mutations
1. WebSocket Connection Management Issues ⚠️

ChatService (chat.service.ts):
// ❌ BAD: Creates new RxStomp instance per service instance
private rxStomp: RxStomp = new RxStomp();

// ❌ BAD: No reconnection handling on auth refresh
// If access token expires, WS connection dies
connectAndSubscribe(groupId: string): void {
const token = this.authService.getAccessToken(); // Stale after 401!

NotificationService has the same issues

Impact:

- Multiple WS connections if service is re-injected
- Connection breaks after token refresh
- No recovery mechanism
1. No Request Deduplication ⚠️

Example: group.service.ts:54
public loadAllGroups() {
return
this.allGroups.load(this.http.get<GroupResponse[]>(`${this.url}/all`));
}

Problem: If 3 components call loadAllGroups() simultaneously:

- 3 identical HTTP requests sent
- Should only send 1 and share the result

Missing: shareReplay() operator (0 instances found in codebase)

1. Auth Token Expiry Issues ⚠️

File: auth.service.ts:119-129
private isTokenExpired(token: string): boolean {
// ... checks expiry
return payload.exp < now + 30; // 30s buffer
}

Problem: Constructor checks refresh token:
// auth.service.ts:22-26
if (!refreshToken || this.isTokenExpired(refreshToken)) {
this.clearTokens(); // ❌ Clears access token too!
}

Issue: If refresh token expires, both tokens are cleared immediately, even if access
token is still valid for hours

---

🔧 API HANDLING ISSUES

1. Inconsistent Error Handling

Error Interceptor (error.interceptor.ts:11-24):
// ❌ Navigates away from page on every 404/500
case 404:
router.navigate(['/not-found']);
break;

Problem: If a secondary API call fails (loading user avatar):

- User is forcefully navigated away from their current page
- Loses their work/context

Should: Only navigate on critical route-level errors

1. No Retry Logic ⚠️

Finding: 0 instances of retry() or retryWhen() operators

Impact: Transient network failures cause permanent errors

- No retry for 5xx errors
- No exponential backoff
- User must manually refresh
1. Optimistic Updates Without Rollback ⚠️

Example: session.service.ts:28-32
public createSession(payload: CreateSessionRequest) {
return this.http.post<CreateSessionResponse>(`${this.url}/create`, payload).pipe(
tap((newSession) => {
this.allSessions.mutate((sessions) => [...sessions, newSession]);
}),
);
}

Issue: If subscription is made but HTTP fails:

- tap() never runs → state not updated
- But if .subscribe() is in template with async pipe and the observable errors, no
rollback logic

Better: Rollback on error or use proper mutation pattern

1. No HTTP Request Cancellation ⚠️

Finding: No usage of takeUntil() on HTTP requests

Problem: User navigates away from page:

- HTTP requests continue
- Responses update destroyed component state
- Wasted bandwidth

---

🎯 OPTIMIZATION CONCERNS

1. Loading Service Global State ⚠️

File: loading.service.ts:4-13
@Injectable({ providedIn: 'root' })
export class LoadingService {
isLoading = signal(false);
}

Problem: Single global loading state

- Can't show loading per-request or per-component
- Can't differentiate critical vs background requests
1. Missing OnPush Change Detection ⚠️

Finding: No changeDetection: ChangeDetectionStrategy.OnPush found in components

Impact:

- Unnecessary change detection cycles
- Performance degradation on large lists/components
1. No trackBy Functions ⚠️

Finding: Need to verify @for loops have track expressions

Impact: Angular re-renders entire lists on data changes

1. Chat History Loading Pattern ⚠️

File: chat.service.ts:42-55
loadChatHistory(groupId: string): Observable<GroupMessageResponse[]> {
const request$ = this.http.get<GroupMessageResponse[]>(url);

```
request$.subscribe({ // ❌ Internal subscription!
  next: (history) => {
    this.messagesSubject.next(history);
  },
  error: (err) => console.error('Failed to load history', err),
});

return request$; // ❌ Returns different observable
```

}

Issues:

- Creates two subscriptions if caller also subscribes
- Error handling duplicated
- Should use tap() operator instead
1. Excessive Interceptor Overhead ⚠️

Current chain: authInterceptor → errorInterceptor → loadingInterceptor →
cacheInterceptor

Issue: Every request goes through 4 interceptors

- Loading interceptor triggers on ALL requests (even cached ones)
- Cache interceptor checks happen after loading starts

Better order: cacheInterceptor → authInterceptor → loadingInterceptor → errorInterceptor

---

📊 SUMMARY METRICS

┌──────────────────────────┬─────────────┬────────────────┬────────────────────┐
│          Issue           │  Severity   │     Count      │       Impact       │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ Unmanaged subscriptions  │ 🚨 Critical │ 43+            │ Memory leaks       │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ Loading race conditions  │ 🚨 Critical │ 1              │ UX bugs            │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ Cache invalidation bugs  │ ⚠️ High     │ 1              │ Stale data         │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ WS connection issues     │ ⚠️ High     │ 2              │ Connection drops   │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ No request deduplication │ ⚠️ Medium   │ 15+ services   │ Redundant requests │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ No retry logic           │ ⚠️ Medium   │ All requests   │ Poor resilience    │
├──────────────────────────┼─────────────┼────────────────┼────────────────────┤
│ Missing OnPush           │ ⚠️ Medium   │ All components │ Performance        │
└──────────────────────────┴─────────────┴────────────────┴────────────────────┘

---

🎯 PRIORITY RECOMMENDATIONS

1. Fix loading interceptor (1 line change, massive impact)
2. Implement request counter in LoadingService
3. Add shareReplay(1) to all service data loading methods
4. Fix cache invalidation to match query params
5. Add retry logic with exponential backoff
6. Add OnPush change detection to components

Would you like me to provide specific code fixes for any of these issues?