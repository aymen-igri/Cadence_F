import { Signal } from "@angular/core";
import { Observable } from "rxjs";
import { finalize, tap, shareReplay } from "rxjs/operators";
import { signal } from "@angular/core";

export interface QueryState<T> {
  data: Signal<T>;
  isLoading: Signal<boolean>;
  load: (source$: Observable<T>) => Observable<T>;
  mutate: (updater: (current: T) => T) => void;
  set: (value: T) => void;
}

export function createQuery<T>(initialValue: T): QueryState<T> {
  const _data = signal<T>(initialValue);
  const _isLoading = signal(false);
  let _pendingRequest: Observable<T> | null = null;

  return {
    data: _data.asReadonly(),
    isLoading: _isLoading.asReadonly(),
    load: (source$: Observable<T>) => {
      if (_pendingRequest) {
        return _pendingRequest;
      }

      _isLoading.set(true);
      _pendingRequest = source$.pipe(
        tap((result) => _data.set(result)),
        finalize(() => {
          _isLoading.set(false);
          _pendingRequest = null;
        }),
        shareReplay(1)
      );
      return _pendingRequest;
    },
    mutate: (updater) => _data.update(updater),
    set: (value) => _data.set(value),
  };
}
