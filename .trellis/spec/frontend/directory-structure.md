# Directory Structure

> How frontend code is organized in this project.

---

## Overview

This frontend is a small Angular 17 application built with **standalone components**.
It does not use NgModules or a feature-per-folder architecture yet. The current shape is:

- route definitions and application providers at `src/app/app.routes.ts` and `src/app/app.config.ts`
- UI components under `src/app/components/**`
- HTTP/auth logic under `src/app/services/**`
- bootstrap files under `src/`

When adding new code, follow the existing layout unless the team explicitly decides to refactor the app into a larger feature-based structure.

---

## Directory Layout

```
src/
├── main.ts
├── test.ts
├── assets/
└── app/
    ├── app.component.ts
    ├── app.config.ts
    ├── app.routes.ts
    ├── components/
    │   ├── auth/
    │   │   └── login.component.ts
    │   └── report/
    │       ├── report-viewer.component.ts
    │       └── report-run-flow.component.ts
    └── services/
        ├── auth.service.ts
        ├── auth.guard.ts
        ├── auth.interceptor.ts
        └── report.service.ts
```

---

## Module Organization

### Current project pattern

- Put route-level UI in `components/`.
- Put reusable HTTP/auth/session logic in `services/`.
- Keep route wiring in `app.routes.ts`.
- Keep root DI/provider setup in `app.config.ts`.

### How to add new code

- Add a new route page as a standalone component under the relevant subfolder in `components/`.
- Add API access or shared session logic to a service instead of duplicating `HttpClient` calls in components.
- Add new guards/interceptors beside the auth ones in `services/` if they are cross-cutting concerns.
- Keep one responsibility per file where practical. The current `report-viewer.component.ts` is a legacy example of too many concerns in one file.

### Example

```ts
export const routes: Routes = [
  { path: 'reports', component: ReportViewerComponent, canActivate: [authGuard] },
  { path: 'runs/:id/flow', component: ReportRunFlowComponent, canActivate: [authGuard] }
];
```

---

## Naming Conventions

- Use kebab-case for filenames: `report-viewer.component.ts`, `auth.interceptor.ts`.
- Use suffixes that describe the role of the file:
  - `*.component.ts` for UI components
  - `*.service.ts` for injectable services
  - `*.guard.ts` for route guards
  - `*.interceptor.ts` for HTTP interceptors
- Use PascalCase for class names and component names.
- Keep route path segments lowercase.

### Good example

```ts
export class ReportRunFlowComponent implements OnInit {}
```

### Avoid

```ts
// Avoid generic filenames like:
// utils.ts
// page.ts
// helper.ts
```

---

## Examples

- `src/app/services/auth.service.ts` — focused service for login/session persistence
- `src/app/services/auth.guard.ts` — cross-cutting route access logic
- `src/app/components/report/report-run-flow.component.ts` — a small route component with a single responsibility
- `src/app/components/report/report-viewer.component.ts` — useful as a warning sign; avoid adding more responsibilities to similar large components
