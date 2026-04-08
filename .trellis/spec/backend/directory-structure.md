# Directory Structure

> How backend code is organized in this project.

---

## Overview

This backend is a Spring Boot application organized by **technical layer** under `com.legacy.report`.
The current codebase is small enough that package-per-layer is still workable.

Business rules live mainly in services, HTTP endpoints live in controllers, persistence is split between Spring Data repositories and a JDBC DAO, and cross-cutting configuration lives in `config`, `security`, and `exception`.

---

## Directory Layout

```
src/main/java/com/legacy/report/
├── ReportApplication.java
├── config/
│   ├── SecurityConfig.java
│   └── UserInitializer.java
├── controller/
│   ├── AuthController.java
│   ├── ReportController.java
│   └── ReportRunController.java
├── dao/
│   └── ReportDao.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   └── UserDto.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── ReportExportException.java
├── model/
│   ├── Report.java
│   ├── ReportAuditEvent.java
│   ├── ReportRun.java
│   └── User.java
├── repository/
│   ├── ReportAuditEventRepository.java
│   ├── ReportRunRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── JwtTokenProvider.java
└── service/
    ├── AuditService.java
    ├── AuthService.java
    ├── CurrentUserService.java
    ├── ReportExcelExportService.java
    ├── ReportRunService.java
    └── ReportService.java

src/main/resources/
├── application.yml
├── schema.sql
├── data.sql
└── report-templates/
```

---

## Module Organization

### Current project pattern

- `controller/` exposes REST endpoints and request parsing
- `service/` contains approval flow, auth logic, audit recording, export orchestration, and current-user rules
- `repository/` contains Spring Data JPA repositories for persisted entities
- `dao/` contains direct JDBC access for report definitions and dynamic report execution
- `model/` contains JPA entities and domain records
- `dto/` contains HTTP request/response DTOs

### How to add new code

- Put new HTTP endpoints in a controller.
- Put authorization checks and business decisions in a service.
- Put entity persistence in a repository.
- Use the DAO layer only when the logic truly depends on dynamic SQL/JdbcTemplate behavior.
- Keep cross-cutting behavior in `config`, `security`, or `exception`, not mixed into feature services.

### Example

```java
@RestController
@RequestMapping("/api/report-runs")
public class ReportRunController {

    @Autowired
    private ReportRunService reportRunService;
}
```

---

## Naming Conventions

- Controllers end with `Controller`
- Services end with `Service`
- Repositories end with `Repository`
- DTOs end with `Request`, `Response`, or `Dto`
- Security helpers use concrete names such as `JwtTokenProvider`
- Entity/model classes use singular nouns such as `ReportRun`

Package names are lowercase. Class names are PascalCase. Methods are camelCase.

---

## Examples

- `service/ReportRunService.java` — core approval-flow business logic
- `controller/ReportRunController.java` — thin HTTP layer delegating to services
- `repository/ReportRunRepository.java` + `model/ReportRun.java` — JPA persistence path
- `dao/ReportDao.java` — legacy/raw SQL path used for report definitions and dynamic execution
