# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This frontend is still small and pragmatic, so code quality depends more on **consistency with the existing Angular structure** than on heavy tooling.
When changing the frontend, optimize for:

- clear route/component boundaries
- typed service calls
- simple state flow
- explicit auth and role checks

Use these guidelines to keep new work cleaner than the current legacy hotspots without pretending the app is already fully standardized.

---

## Forbidden Patterns

- Do not call backend APIs directly from templates or ad hoc browser utilities; use services.
- Do not bypass `AuthService`, `authGuard`, or `authInterceptor` for auth-related behavior.
- Do not add new React-style hook patterns or state libraries to this Angular app.
- Do not introduce new hardcoded demo credentials or token handling logic outside auth-related code.
- Do not grow another all-in-one screen like `report-viewer.component.ts` if the feature can be isolated.

### Avoid

```ts
this.http.get('/api/reports').subscribe(...)
```

inside a component that should be calling `ReportService`.

---

## Required Patterns

### 1. Keep HTTP in services

```ts
getAuditTrail(runId: number): Observable<ReportAuditEvent[]> {
  return this.http.get<ReportAuditEvent[]>(`${this.apiUrl}/report-runs/${runId}/audit`);
}
```

### 2. Use route guards for access control

```ts
{ path: 'checker', component: ReportViewerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['CHECKER'] } }
```

### 3. Keep loading/error state visible in the component

Every async screen should expose enough state for the template to render loading and error feedback clearly.

### 4. Stay aligned with standalone Angular

New screens/components should continue using standalone components and provider-based app setup unless there is a deliberate architecture migration.

---

## Testing Requirements

The repo currently has Angular test infrastructure but very little real test coverage.
For new frontend work:

- run `npm test` when frontend behavior changes
- run `npm run build` before finishing frontend changes
- manually verify the affected workflow when the change touches login, maker/checker flow, or export

If you add non-trivial logic to a service, guard, or reusable component, add unit tests instead of relying only on manual checks.

Minimum manual regression flow:

1. login
2. load reports
3. execute a report
4. submit or decide a run if the change touches approval flow
5. verify export if the change affects report/run actions

---

## Code Review Checklist

- Does the change follow standalone Angular patterns already used in the app?
- Is backend communication still centralized in services?
- Are auth and role checks still enforced through guards/interceptors?
- Did the change add more responsibilities to an already large component that should have been split?
- Are request/response types explicit enough for the touched code?
- Were the relevant frontend validators and manual workflow checks run?
