# AGENTS.md

## Purpose

This is the repository-level operating guide for AI agents working in this project.
Use it as the first-stop document for understanding:

- repository structure
- required reading before coding
- local run and validation commands
- Trellis / Factory / project-local workflow conventions

This repository is optimized for Trellis-style multi-agent collaboration, so agents should treat this file as the entry point before reading deeper guidance.

## Quick Start for Agents

When starting a new task in this repository:

1. Read this file.
2. If Trellis is in use, read `.trellis/workflow.md`.
3. Read the relevant spec docs before touching code:
   - frontend work: `.trellis/spec/frontend/index.md`
   - backend work: `.trellis/spec/backend/index.md`
   - cross-layer work: `.trellis/spec/guides/cross-layer-thinking-guide.md`
4. Inspect current repo state:
   - `git status`
   - target app config files
   - neighboring code and existing patterns
5. Run the smallest useful validation while iterating, then run the relevant final validators before finishing.

### Priority of instructions

If instructions conflict, use this order:

1. direct user request
2. this `AGENTS.md`
3. Trellis / Factory rules referenced from this file
4. README and surrounding code conventions

## Repository Overview

This is a full-stack report approval application with two main apps:

- `frontend/` — Angular app on port `4200`
- `backend/` — Spring Boot app on port `8080`

Important support directories:

- `.trellis/` — workflow, task tracking, specs, workspace state, and multi-agent scripts
- `.factory/` — project memories and shared coding rules
- `.agents/` — project-local skills/prompts for agent workflows

## Working Rules

- Stay within repository boundaries.
- Follow existing code patterns before introducing new abstractions.
- Read surrounding code before editing.
- Keep changes scoped to the task.
- Prefer the repo's existing stack and conventions over adding new tools.
- For cross-layer changes, verify both frontend and backend assumptions.
- Before claiming completion, run the relevant validation commands for the areas you changed.

## Required Reading Before Coding

### Frontend tasks

Read in this order:

1. `.trellis/spec/frontend/index.md`
2. `.trellis/spec/frontend/component-guidelines.md`
3. `.trellis/spec/frontend/type-safety.md`
4. `.trellis/spec/frontend/quality-guidelines.md`

### Backend tasks

Read in this order:

1. `.trellis/spec/backend/index.md`
2. `.trellis/spec/backend/directory-structure.md`
3. `.trellis/spec/backend/database-guidelines.md`
4. `.trellis/spec/backend/logging-guidelines.md`
5. `.trellis/spec/backend/quality-guidelines.md`

### Cross-layer tasks

Also read:

- `.trellis/spec/guides/cross-layer-thinking-guide.md`

## Local Development

### Prerequisites

Recommended local environment (Windows 开发机):

- Node.js 18+ and npm
- Java JDK 17+
- Git
- Network access to npm registry and Gradle/Maven dependencies

### Frontend

From `frontend/`:

```bash
npm install
npm start
```

Notes:

- `npm start` maps to `ng serve --port 4200`
- frontend URL: `http://localhost:4200`

### Backend

From `backend/`, prefer the wrapper:

```bash
.\gradlew.bat bootRun
```

or on Linux/macOS:

```bash
./gradlew bootRun
```

Notes:

- backend URL: `http://localhost:8080`
- the backend uses an in-memory H2 database for local development
- if wrapper execution fails, verify that `backend/gradle/wrapper/` is complete in the current checkout

### Default local users

The local setup is intended to initialize:

- `admin / 123456` — MAKER + CHECKER
- `maker1 / 123456` — MAKER
- `checker1 / 123456` — CHECKER

## Validation Commands

Run the commands relevant to the code you touched.

### Frontend validators

From `frontend/`:

```bash
npm test
npm run build
```

Available scripts:

- `npm start`
- `npm run build`
- `npm run watch`
- `npm test`

### Backend validators

From `backend/`:

```bash
.\gradlew.bat test
.\gradlew.bat bootRun
```

On Linux/macOS:

```bash
./gradlew test
./gradlew bootRun
```

### Manual workflow verification

For approval-flow related changes, verify at least:

1. login as Maker and Checker
2. Maker executes a report
3. Maker submits a generated run
4. Checker approves or rejects it
5. audit timeline remains visible
6. export still works for allowed states

## Application Workflow Notes

### Frontend routes

Key routes:

- `/login`
- `/maker`
- `/checker`
- `/reports`

### Backend API areas

- authentication via `/api/auth/*`
- reports via `/api/reports/*`
- approval flow via `/api/report-runs/*`

### Role model

- Maker users generate and submit report runs
- Checker users review submitted runs and approve or reject them

## Agent Configuration

For this repository, agents should prioritize these sources of truth:

1. root `AGENTS.md`
2. `.trellis/workflow.md`
3. `.trellis/spec/**`
4. `.factory/rules/**`
5. existing code in the target area

Important supporting files:

- `.factory/rules/testing.md`
- `.factory/rules/typescript.md`
- `.factory/memories.md`

Project-local agent skills also exist under `.agents/skills/`.

## Development Notes

- Prefer this file and `.trellis/` over `README.md` for day-to-day agent execution guidance.
- `README.md` is more hackathon-oriented; it is not the primary operational guide.
- Validate assumptions against actual repo files before making sweeping changes.
- Use conservative wording when repository tooling appears incomplete or partially configured.

<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

Use the `/trellis:start` command when starting a new session to:
- Initialize your developer identity
- Understand current project context
- Read relevant guidelines

Use `@/.trellis/` to learn:
- Development workflow (`workflow.md`)
- Project structure guidelines (`spec/`)
- Developer workspace (`workspace/`)

Keep this managed block so 'trellis update' can refresh the instructions.

<!-- TRELLIS:END -->
