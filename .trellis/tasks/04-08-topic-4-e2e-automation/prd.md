# Topic 4: Frontend End-to-End Automation Testing

## Goal
Establish a frontend E2E testing setup for the existing Angular application and cover critical user journeys so regressions can be caught reliably.

## Initial Requirements
- Set up E2E test infrastructure for the frontend application.
- Cover critical user journeys with automated tests.
- Demonstrate how the tests reduce regression risk for future development.
- Reuse existing project patterns and any existing automation foundation where possible.
- The first required E2E scope is the full approval happy path: login, maker report execution/submission, checker review/decision, and validation that the flow completes successfully.
- The E2E suite should exercise the real local Spring Boot backend rather than browser-level API mocks.
- The design should use Playwright Java as the in-repo E2E framework.
- The Playwright Java suite should live under the backend Gradle project instead of the frontend workspace.
- The scope should include local execution plus CI-ready scripts.

## Open Questions
- None yet. Additional details may emerge during design review.

## Acceptance Criteria
- [ ] An agreed Java-based E2E framework is integrated into the repository through the backend Gradle project.
- [ ] Critical user journeys are defined and covered by automated tests.
- [ ] Test execution is documented in task context and runnable locally.
- [ ] Validation commands for impacted areas pass.
