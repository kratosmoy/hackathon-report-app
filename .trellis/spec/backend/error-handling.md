# Error Handling

> How errors are handled in this project.

---

## Overview

Error handling in the current backend is **partially standardized**:

- most business and authorization failures still throw `RuntimeException`
- one domain-specific exception exists: `ReportExportException`
- one global handler exists: `GlobalExceptionHandler`

New code should follow the current shape, but improve it incrementally instead of adding more anonymous runtime failures.

---

## Error Types

### Current project state

- `RuntimeException` is widely used for business rule failures
- `ReportExportException` is used for export-specific failures

### Guidance for new code

- Prefer a specific exception type when the failure has a stable meaning.
- Extend `GlobalExceptionHandler` when a new error should return a predictable API response.
- Reserve raw `RuntimeException` for temporary or clearly internal failures, not as the default public API contract.

### Example

```java
if (!"Submitted".equals(run.getStatus())) {
    throw new RuntimeException("只能对 Submitted 状态的报表运行实例进行审批");
}
```

This is current behavior. For new flows, prefer a dedicated exception if clients need to react differently.

---

## Error Handling Patterns

### Current patterns

- Controllers usually delegate and let exceptions bubble up.
- Services perform most business validation and throw on rule violations.
- Export code logs recoverable failures and throws a typed exception for client-facing export problems.

### Example

```java
@ExceptionHandler(ReportExportException.class)
public ResponseEntity<Map<String, Object>> handleReportExportException(ReportExportException ex) {
    logger.warn("Report export error: {}", ex.getMessage());
    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                    "error", "REPORT_EXPORT_ERROR",
                    "message", ex.getMessage()
            ));
}
```

### Guidance

- Validate early in services.
- Keep controllers thin.
- Use `try/catch` when you can degrade gracefully or translate infrastructure failures into clearer domain errors.
- Do not swallow exceptions silently.

---

## API Error Responses

API error responses are **not fully standardized yet**.
The only explicit contract currently handled globally is the export error shape:

```json
{
  "error": "REPORT_EXPORT_ERROR",
  "message": "..."
}
```

For new API-facing exception types, align with this idea:

- machine-readable `error` code
- human-readable `message`
- appropriate HTTP status

Do not introduce multiple unrelated error payload shapes for similar failures if you can avoid it.

If a new error becomes part of a stable workflow contract, add a handler in `GlobalExceptionHandler` instead of relying on framework defaults.

---

## Common Mistakes

- Throwing `RuntimeException` everywhere without a stable API error contract.
- Returning framework-default 500 responses for business validation failures that should be expressed more clearly.
- Logging too little context before rethrowing.
- Handling errors directly in controllers when the same rule should live in the service layer.
