# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

This backend uses a **mixed persistence model**:

- Spring Data JPA for workflow entities such as `ReportRun`, `ReportAuditEvent`, and `User`
- `JdbcTemplate` in `ReportDao` for report-definition lookup and dynamic SQL execution
- `schema.sql` and `data.sql` for local bootstrap data in the H2 database

This mixed model is already in production in the repo, so new code should respect it instead of forcing everything into one style.

---

## Query Patterns

### 1. Use repositories for stable application entities

Examples:

- `ReportRunRepository`
- `ReportAuditEventRepository`
- `UserRepository`

These are the right place for persisted approval-flow data and user/session lookups.

### 2. Use the DAO layer for report SQL and tabular result sets

`ReportDao` currently handles:

- reading report definitions from `report_config`
- executing dynamic report SQL via `JdbcTemplate`

### 3. Prefer parameterized queries when values are known

Good current example:

```java
String sql = "SELECT id, name, sql, description FROM report_config WHERE id = ? AND is_deleted = 0";
List<Report> results = jdbc.query(sql, new ReportMapper(), id);
```

Avoid expanding the unsafe legacy pattern:

```java
public List<Map<String, Object>> executeSql(String sql) {
    return jdbc.queryForList(sql);
}
```

### 4. Transactions belong in services

Approval-flow write operations are wrapped at the service layer:

```java
@Transactional
public ReportRun submitRun(Long runId) { ... }
```

Keep multi-step state transitions transactional in services rather than in controllers or DAOs.

---

## Migrations

This repo does **not** currently use Flyway or Liquibase.
Database shape is bootstrapped from:

- `src/main/resources/schema.sql`
- `src/main/resources/data.sql`

That means:

- treat schema changes carefully
- keep bootstrap SQL readable and deterministic
- do not claim migration history exists when it does not

For now, if you add schema for a local/dev feature, update the bootstrap SQL files consistently.

If the team later adopts a migration tool, these guidelines should be updated immediately.

---

## Naming Conventions

Database naming in this repo follows SQL-style snake_case.

### Tables

- `report_config`
- `report_run`
- `report_audit_event`
- `customer`
- `order_items`

### Columns

- `report_id`
- `maker_username`
- `generated_at`
- `is_deleted`

### Java side

- entity fields use camelCase
- `@Column(name = "...")` maps Java fields to snake_case columns where needed

Example:

```java
@Column(name = "generated_at", nullable = false)
private LocalDateTime generatedAt;
```

---

## Common Mistakes

- Concatenating parameters into SQL strings. `generateReport()` currently does this and should be treated as legacy behavior, not a recommended pattern.
- Exposing raw SQL execution paths through public APIs. `runReport(String sql)` is a legacy escape hatch and should not be copied into new features.
- Mixing business validation into DAO code. Keep rule checks in services.
- Assuming schema migration tooling exists. Today the repo relies on bootstrap SQL files instead.
