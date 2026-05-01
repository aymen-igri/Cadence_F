import { signal, Signal } from "@angular/core";
import { catchError, EMPTY, finalize, Observable, tap } from "rxjs";
import { extractErrorMessage } from "./error.util";


export interface MutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Observable<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: string, variables: TVariables) => void;
  onSettled?: () => void;
}

export interface MutationState<TData, TVariables> {
  isPending: Signal<boolean>;
  isSuccess: Signal<boolean>;
  isError: Signal<boolean>;
  error: Signal<string | null>;
  data: Signal<TData | null>;
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Observable<TData>;
}

export function createMutation<TData, TVariables>(
  options: MutationOptions<TData, TVariables>,
): MutationState<TData, TVariables> {
  const _isPending = signal(false);
  const _isSuccess = signal(false);
  const _isError = signal(false);
  const _error = signal<string | null>(null);
  const _data = signal<TData | null>(null);

  const mutateAsync = (variables: TVariables): Observable<TData> => {
    _isPending.set(true);
    _isSuccess.set(false);
    _isError.set(false);
    _error.set(null);

    return options.mutationFn(variables).pipe(
      tap((data) => {
        _data.set(data);
        _isSuccess.set(true);
        options.onSuccess?.(data, variables);
      }),
      catchError((err) => {
        const message = extractErrorMessage(err);
        _isError.set(true);
        _error.set(message);
        options.onError?.(message, variables);
        return EMPTY;
      }),
      finalize(() => {
        _isPending.set(false);
        options.onSettled?.();
      }),
    );
  };

  return {
    isPending: _isPending.asReadonly(),
    isSuccess: _isSuccess.asReadonly(),
    isError: _isError.asReadonly(),
    error: _error.asReadonly(),
    data: _data.asReadonly(),
    mutate: (variables) => mutateAsync(variables).subscribe(),
    mutateAsync,
  };
}
