# Work Log

This file records project progress, design judgments, and notable adjustments. It is intentionally concise and evidence-based. It complements the course requirement in [phase_cli_1.md](phase_cli_1.md) and the project design constraints in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

---

## 2026-10-14 — Phase 1 bootstrap and project constraint setup

### Goal
Establish the initial TypeScript / Node.js project skeleton for the SVG CLI and capture the project-level design constraints before moving into subsequent feature work.

### Implementation content
- Created the base Node.js TypeScript project configuration.
- Added the minimal CLI entry point and the initial REPL loop.
- Built the command object abstraction and a simple registry-based command dispatch layer.
- Added the basic document and canvas model shell.
- Added the initial group-based shape skeleton and history boundary.
- Added smoke-test validation for the startup path.
- Created the project documentation set:
  - [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md)
  - [WORKLOG.md](WORKLOG.md)

### Design judgment
We intentionally kept the initial structure small and object-oriented without implementing the full SVG feature set. This matches the course requirement for a clean Phase 1 foundation and avoids speculative feature work.

The key architectural choices were:
- object-oriented command layer,
- model-level document abstraction,
- group-first Composite model foundation,
- explicit IO boundary for console interaction,
- no premature plugin or serialization infrastructure.

### AI suggestions and human judgment
The initial scaffold was created with a straightforward object-oriented design using a registry-based command pattern and model abstractions. This was accepted because it matches the course emphasis on clean architecture and future expandability.

We intentionally did not implement the business features listed in [phase_cli_1.md](phase_cli_1.md), because that would exceed the phase boundary.

### Problems identified
The project was intentionally small, but the current model implementation already contains a map-based lookup helper in [src/model/Document.ts](src/model/Document.ts). This is a useful convenience for quick access, but it is not the preferred architecture described in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

The mismatch is limited and has not yet reached a level where a large refactor is justified. It is therefore tracked rather than silently rewritten in the current pass.

### Adjustment
We recorded the architecture preference explicitly in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) and kept the project moving without a broad refactor. This preserves the current working state while preventing the design decision from being forgotten.

### Verification
We ran the current validation commands and verified the project stays in a working state:
- npm test
- printf 'help\nexit\n' | npm run cli

The CLI boots correctly, prints the expected banner, accepts help, and exits cleanly.

### Current residuals
- The document model still includes a convenience lookup map in [src/model/Document.ts](src/model/Document.ts), which conflicts with the preferred tree-first lookup strategy.
- No full Lab feature implementation was added beyond the required minimal CLI skeleton.

---

## 2026-10-14 — Documentation and constraint mechanism established

### Goal
Create the decision log and working journal as permanent project constraints and recording artifacts.

### Implementation content
- Added [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) with the project-wide decisions.
- Added [WORKLOG.md](WORKLOG.md) with the current project history and transition notes.

### Design judgment
This is a process-level improvement, not a feature implementation. It ensures future work starts from the same architectural constraints and leaves a record of what changed and why.

### Verification
This documentation change adds no runtime behavior, and no feature implementation was introduced. The project remains in the previously validated working state.

### Current status
The project is ready for the next incremental feature step, with explicit documentation for future design choices and recorded history.
