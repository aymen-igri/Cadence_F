# GitHub Copilot Custom Instructions — Study Platform Frontend

## Stack
- Angular 21 with Standalone Components
- Tailwind CSS for styling
- Spartan UI as the component library

## Project Structure
- `src/app/components/` — feature components, organized by role → feature → sub-component
  - e.g. `components/user/dashboard/goal-progress/goal-progress.ts` + `goal-progress.html`
  - e.g. `components/admin/dashboard/...`
- `src/app/pages/` — route-level containers only, no heavy logic
- `src/app/core/services/` — all services
- `src/app/core/models/` — interfaces and types
- `src/app/core/interceptors/` — HTTP interceptors
- `src/app/core/guards/` — route guards
- `src/components/ui/` — Spartan UI components (never import directly, always use aliases)
- `src/app/app.routes.ts` — single central routing file

## Path Aliases
Always use aliases. Never use relative paths.

### App
- `@app/pages/*` → `src/app/pages/*`
- `@app/components/*` → `src/app/components/*`
- `@app/core/*` → `src/app/core/*`
- `@app/layouts/*` → `src/app/layouts/*`
- `@app/env/*` → `src/environments/*`

### Spartan UI
Always import Spartan UI via `@spartan-ng/helm/*`:
- `@spartan-ng/helm/button`
- `@spartan-ng/helm/card`
- `@spartan-ng/helm/input`
- `@spartan-ng/helm/alert`
- `@spartan-ng/helm/utils`
- *(other helm components follow the same pattern)*

## Coding Guidelines
- This project is zoneless — do not use Zone.js-based patterns or `NgZone`

### Angular
- Standalone Components, Directives, and Pipes by default — no NgModules
- Use `inject()` for DI, never constructor injection
- Prefer Signals (`signal`, `computed`, `effect`) for local state over property bindings + lifecycle hooks
- Strictly typed Reactive Forms (`FormGroup`, `FormControl` with generic types)
- Use RxJS operators correctly (`switchMap`, `catchError`, etc.) — always unsubscribe via `takeUntilDestroyed` or `async` pipe
- Use `@defer` blocks for deferred loading where applicable
### Angular
// ...existing code...
- Use modern built-in control flow (`@if`, `@for`, `@switch`) — NEVER use `*ngIf`, `*ngFor`, or `*ngSwitch`.
- Use Signal-based inputs (`input()`, `input.required()`, `model()`), outputs (`output()`), and queries (`viewChild()`, `contentChild()`) — NEVER use `@Input()`, `@Output()`, `@ViewChild()`, or `@ContentChild()` decorators.
- Use self-closing tags for components where applicable.
### Styling
- Tailwind utility classes in templates — avoid custom CSS unless necessary
- Always use Spartan UI components via aliases instead of raw HTML elements

## General Rules
- Keep functions small and pure
- No magic strings or numbers — use enums or constants
- Always type return values explicitly
- Prioritize accessibility: use aria attributes and role tags on all UI components