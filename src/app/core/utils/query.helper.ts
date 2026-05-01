import { Signal } from "@angular/core";
import { Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";
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

  return {
    data: _data.asReadonly(),
    isLoading: _isLoading.asReadonly(),
    load: (source$: Observable<T>) => {
      _isLoading.set(true);
      return source$.pipe(
        tap((result) => _data.set(result)),
        finalize(() => _isLoading.set(false)),
      );
    },
    mutate: (updater) => _data.update(updater),
    set: (value) => _data.set(value),
  };
}
