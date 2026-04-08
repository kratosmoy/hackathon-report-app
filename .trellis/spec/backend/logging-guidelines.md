# Logging Guidelines

> How logging is done in this project.

---

## Overview

This backend primarily uses **SLF4J + LoggerFactory** for application logging.
The stronger examples use event-style structured messages plus fields, especially in approval-flow services.

The repo also still contains a small amount of legacy console logging. Treat that as technical debt, not a pattern to copy.

---

## Log Levels

### INFO

Use `info` for major business workflow events:

- report run execution started/completed
- report run submitted
- report run approved/rejected
- audit events recorded

Example:

```java
logger.info("event=report_run_submit_success runId={} reportId={} maker={}",
        saved.getId(), saved.getReportId(), currentUser.getUsername());
```

### WARN

Use `warn` when the system can continue but something important went wrong or degraded:

```java
logger.warn("Failed to parse result snapshot for run {}. Fallback to re-execute SQL.", runId, e);
```

### ERROR

Use `error` for failures that block the requested operation:

```java
logger.error("Failed to render Excel template for reportId={}", reportId, e);
```

The repo does not currently use `debug` heavily. Add it only for targeted diagnostics, not as a replacement for clear `info`/`warn` events.

---

## Structured Logging

The best current pattern is key-value style messages:

```java
logger.info("event=report_run_decision_success runId={} reportId={} checker={} decision={} commentPresent={}",
        saved.getId(), saved.getReportId(), currentUser.getUsername(),
        approve ? "Approved" : "Rejected",
        comment != null && !comment.trim().isEmpty());
```

Prefer including:

- `event=...`
- the primary domain identifier (`runId`, `reportId`, username when useful)
- outcome or decision fields

This is especially important for approval-flow logic, where auditability matters.

Do not add free-form logs that hide the domain entity involved.

---

## What to Log

- business state transitions in the maker/checker approval flow
- export generation failures and template issues
- fallback behavior that changes how a request is fulfilled
- security-relevant workflow events when they help diagnose access issues
- metrics-related milestones when the log adds context not visible in counters alone

Metrics already exist via Micrometer; logs should complement them with request/workflow context.

---

## What NOT to Log

- JWT secrets or tokens
- raw passwords
- full result snapshots or large SQL result payloads
- personally sensitive user/customer fields unless there is a strong operational reason

### Legacy pattern to remove over time

```java
System.out.println("Database test failed: " + e.getMessage());
e.printStackTrace();
```

Do not introduce new `System.out.println` or `printStackTrace()` logging. Use SLF4J consistently instead.
