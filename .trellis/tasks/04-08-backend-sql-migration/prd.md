# Backend SQL Migration

## Goal

Move representative report business logic out of SQL-heavy paths and into clearer Java service-layer logic while preserving behavior needed for the hackathon demo.

## Requirements

- Inventory the current report SQL and identify the best migration candidates.
- Define what logic should remain in SQL versus what should move to Java.
- Create a backend refactor pattern that improves maintainability without requiring a full platform rewrite.
- Migrate at least one representative report deeply enough to show value.
- Protect maker/checker/export behavior while refactoring.

## Acceptance Criteria

- [ ] A ranked inventory of report SQL complexity exists.
- [ ] A migration strategy note exists.
- [ ] A backend structure/pattern for migration is established.
- [ ] At least 1 representative report is migrated and explainable.
- [ ] Validation results exist for the workflow paths affected by the migration.

## Technical Notes

- Do not try to migrate every seeded report in one pass.
- Preserve API compatibility where possible so frontend beautification can proceed on stable behavior.
- Use this task to create one strong example of SQL-to-Java maintainability improvement.
