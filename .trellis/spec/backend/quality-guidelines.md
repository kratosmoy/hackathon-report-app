# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

This backend mixes legacy report SQL behavior with newer approval-flow service logic.
Quality work here means two things:

1. preserve the current application behavior
2. avoid extending the unsafe or messy legacy patterns that already exist

New backend changes should make the codebase more explicit and layered, even when they cannot fully clean up old code.

---

## Forbidden Patterns

- Do not add new endpoints that accept arbitrary SQL from clients.
- Do not move business rule checks into controllers or DAOs.
- Do not add new `System.out.println` / `printStackTrace()` logging.
- Do not introduce more anonymous `RuntimeException` usage when a stable domain exception would be clearer.
- Do not mix approval-flow writes across multiple layers when a single transactional service method can own the state transition.

### Legacy code to avoid copying

```java
public List<Map<String, Object>> runReport(String sql) {
    return reportDao.executeSql(sql);
}
```

---

## Required Patterns

### 1. Keep controllers thin

Controllers should parse request data and delegate:

```java
@PostMapping("/{id}/submit")
public void submit(@PathVariable Long id) {
    reportRunService.submitRun(id);
}
```

### 2. Keep business rules in services

```java
currentUserService.requireRole(currentUser, "CHECKER");
```

### 3. Use transactions for multi-step write workflows

```java
@Transactional
public ReportRun decideRun(Long runId, boolean approve, String comment) { ... }
```

### 4. Keep persistence responsibilities explicit

- repositories for stable entities
- DAO/JdbcTemplate for dynamic report SQL paths

### 5. Prefer explicit DTO/entity models over raw maps

Use `Map<String, Object>` only where the output is inherently dynamic, such as report rows.

---

## Testing Requirements

The repo currently has Gradle test infrastructure but little actual test coverage.
For backend changes:

- run `.\gradlew.bat test` (or `./gradlew test`) when the backend changes
- start the backend locally when the change affects API wiring, auth, or resource bootstrapping
- manually verify maker/checker approval flow when changing workflow services or controllers

If you touch authorization, approval transitions, export behavior, or SQL execution, add or update tests instead of relying only on manual verification whenever practical.

Current repo gap: the test suite is not yet a strong source of truth. New work should improve that rather than assuming it already exists.

---

## Code Review Checklist

- Is the controller still thin, with business logic in services?
- Are authorization and role checks preserved?
- If SQL was touched, did the change avoid expanding unsafe raw SQL paths?
- Does the change fit the existing repository/DAO split?
- Are logs added with meaningful context and without secrets/PII?
- Were transactional boundaries preserved for multi-step write flows?
- Were the relevant backend validators and manual workflow checks run?
