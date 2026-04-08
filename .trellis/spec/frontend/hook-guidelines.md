# Hook Guidelines

> How hooks are used in this project.

---

## Overview

This project is Angular-based, so it does **not** use React hooks.
For Trellis purposes, this file documents the Angular equivalents used for reusable stateful or cross-cutting behavior:

- injectable services
- functional route guards
- HTTP interceptors

If you are coming from a React codebase, treat these as the main replacement for hook-style reuse.

---

## Custom Hook Patterns

### Current equivalents

- `AuthService` stores and exposes authentication/session behavior
- `ReportService` centralizes HTTP calls for reports and approval flow
- `authGuard` and `roleGuard` encapsulate route access logic
- `authInterceptor` adds the JWT header for backend API calls

### Example

```ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { redirect: state.url } });
  return false;
};
```

### Guidance

- Reusable stateful logic belongs in a service first.
- Route access logic belongs in guards, not duplicated inside components.
- Request decoration belongs in interceptors, not repeated in every HTTP call.

---

## Data Fetching

Data fetching is currently done with `HttpClient` inside services that return `Observable<T>`.
Components subscribe to those observables and update local state.

### Example

```ts
getSubmittedRuns(): Observable<ReportRun[]> {
  return this.http.get<ReportRun[]>(`${this.apiUrl}/report-runs/submitted`);
}
```

```ts
this.reportService.getAuditTrail(this.runId).subscribe({
  next: (events) => {
    this.events = events;
    this.loading = false;
  },
  error: (err) => {
    this.error = '加载审批流程失败: ' + (err.error?.message || err.message || '');
    this.loading = false;
  }
});
```

This repo does not currently use NgRx, signals-based stores, or a query/cache library.
Do not introduce a new data-fetching abstraction unless the task clearly requires it.

---

## Naming Conventions

- Do not create React-style `useSomething` utilities in this Angular app.
- Name reusable Angular services by responsibility: `AuthService`, `ReportService`.
- Name guards with the `*Guard` suffix.
- Name interceptors with the `*Interceptor` suffix.

### Good

```ts
export class ReportService {}
export const roleGuard: CanActivateFn = (...) => { ... };
export const authInterceptor: HttpInterceptorFn = (...) => { ... };
```

---

## Common Mistakes

- Repeating auth or API logic inside multiple components instead of extending a service/guard/interceptor.
- Treating services as generic dump files. Keep each service aligned to a clear responsibility.
- Accessing `localStorage` from many places. In this repo, auth/session storage should stay concentrated in auth-related code.
- Moving route authorization logic into page components instead of keeping it in guards.
