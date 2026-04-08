# Type Safety

> Type safety patterns in this project.

---

## Overview

The frontend uses **TypeScript in strict mode**.
`frontend/tsconfig.json` enables:

- `strict`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `noImplicitReturns`
- `noFallthroughCasesInSwitch`
- Angular strict template checks

Type safety is mostly implemented with local interfaces and typed service methods.

---

## Type Organization

### Current project pattern

- Keep route-local types close to the component that uses them.
- Keep API-facing types close to the service that fetches them.
- Export service response models when multiple components consume them.

### Examples

Local component types:

```ts
interface Report {
  id: number;
  name: string;
  sql: string;
  description: string;
}
```

Exported service models:

```ts
export interface ReportRun {
  id: number;
  reportId: number;
  reportName: string;
  status: string;
  makerUsername: string;
  checkerUsername?: string;
}
```

Use a shared type file only when the same model is clearly used in multiple places and keeping it local becomes noisy.

---

## Validation

This repo does **not** currently use a runtime schema library such as Zod or Yup.
Validation is handled in simpler ways:

- form fields marked `required`
- typed request/response contracts in services
- route guards for auth/role checks
- backend validation/error responses

When adding new frontend-only validation, keep it lightweight unless the feature has complex user input.

Current example:

```ts
if (!this.username || !this.password) {
  return;
}
```

---

## Common Patterns

### Typed HTTP requests

```ts
return this.http.get<ReportRun[]>(`${this.apiUrl}/report-runs/submitted`);
```

### Narrow unions for UI decisions

```ts
checkerDecision: 'APPROVED' | 'REJECTED' = 'APPROVED';
```

### Safe parsing around storage

```ts
try {
  return JSON.parse(raw) as UserInfo;
} catch {
  return null;
}
```

Prefer narrow interfaces and unions over broad map/object types whenever the shape is known.

---

## Forbidden Patterns

- Do not introduce new `any`-typed props, state, or service contracts.
- Do not use type assertions to silence real uncertainty unless you also control the source of data.
- Do not return untyped `Observable<any>` from services when the response shape is known.

### Legacy pattern to avoid expanding

```ts
interface ReportData {
  data: any[];
  count?: number;
  custom?: boolean;
}
```

This exists because report rows are dynamic. Keep this contained, and introduce narrower row/view-model types when a screen stabilizes around a known shape.
