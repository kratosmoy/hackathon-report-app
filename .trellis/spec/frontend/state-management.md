# State Management

> How state is managed in this project.

---

## Overview

This frontend currently uses **simple Angular state management**:

- component-local class fields for UI state
- `AuthService` + `localStorage` for session state
- route params / query params for navigation state
- `HttpClient` service methods for server state

There is no NgRx store or other global state library in the current codebase.

---

## State Categories

### 1. Local UI state

Keep page-specific UI state directly on the component class.

Examples from `ReportViewerComponent`:

- `loading`
- `error`
- `selectedReport`
- `checkerDecision`
- `checkerComment`

### 2. Session/auth state

Authentication state is persisted in `localStorage` by `AuthService`.

```ts
localStorage.setItem(this.tokenKey, resp.token);
localStorage.setItem(this.userKey, JSON.stringify(resp.user));
```

Read auth state through `AuthService`, guards, and the auth interceptor instead of parsing storage ad hoc.

### 3. Route state

Use router params and query params for navigation context.

Examples:

- `/runs/:id/flow` uses `ActivatedRoute` param state
- `/login?redirect=...` preserves the intended destination

### 4. Server state

Server state is fetched through `ReportService` and assigned into component fields.
The repo has a `BehaviorSubject<Report[]>`, but most flows still rely on direct request/subscribe patterns.

---

## When to Use Global State

This project currently has very little true global state.
Promote state only when all of these are true:

- more than one route needs it
- it is not just a one-time HTTP response
- keeping copies in multiple components would create drift

Today, the main justified global-ish state is auth/session information.
Do not add a store library just to avoid passing a few values through services.

---

## Server State

Use service methods that return typed observables, then map results into component state.

```ts
this.reportService.getMyRuns().subscribe({
  next: (runs) => {
    this.makerRuns = runs;
  },
  error: (err) => {
    this.makerRunsError = '加载我的提交失败: ' + (err.error?.message || err.message || '');
    this.makerRuns = [];
  }
});
```

Current conventions:

- fetch from services, not directly from `HttpClient` inside components
- keep error/loading state close to the UI that renders it
- refresh lists explicitly after mutating operations such as submit/approve/reject

The repo does not currently implement client-side caching, optimistic updates, or normalized entities.

---

## Common Mistakes

- Putting too many independent concerns in one component state object/class.
- Treating every shared value as “global state” instead of using a focused service.
- Reading auth/session values directly from `localStorage` in unrelated files.
- Forgetting to refresh dependent UI after server mutations.
- Using `any[]` for dynamic table data without adding a narrow view model when a screen stabilizes.
