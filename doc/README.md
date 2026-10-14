# Architecture and Phase 1 Skeleton

## Module breakdown

- `src/cli`: terminal interaction, REPL loop, command registration and dispatch.
- `src/model`: core document state and shared abstractions. This layer owns the editable model and avoids direct CLI coupling.
- `src/model/shapes`: shape hierarchy for the future Composite Pattern; currently includes the root `GroupShape` placeholder.
- `src/commands`: object-oriented command classes, each encapsulating a single action.
- `src/history`: future undo/redo history and command audit trail.
- `src/io`: console input and output adapters to isolate terminal I/O.
- `doc`: phase documentation and architecture notes.
- `test`: smoke tests for the CLI entry point and startup contract.

## Design pattern choices

- Command Pattern: each executable action is a class implementing the `Command` contract. The registry maps command names to objects instead of a monolithic `switch`.
- Composite Pattern: `Shape` and `GroupShape` establish the base for grouping and subtree operations while keeping the DOM-like hierarchy explicit.
- Dependency direction: `cli` depends on `commands`, `model`, and `io`; `commands` depends on `model` and `io`; `model` does not depend on `cli`.

## Dependency rules

- `cli` may depend on `commands` and `model`.
- `commands` may depend on `model`, `history`, and `io`.
- `model` must not depend on `cli` or `commands`.
- `io` is intentionally isolated as a technical adapter.

## Likely future change points

1. Shape kinds and geometry: future graphical primitives and property schemas will expand. The `Shape` abstraction leaves a clean extension point.
2. Command set: more actions will be added without changing the registry API. The command object layer is prepared for this.
3. History and undo/redo: the `HistoryManager` exists as a dedicated boundary for future reversible edits.
4. Composite operations: `GroupShape` is the placeholder for subtree manipulation and container semantics.

## Notes

This phase intentionally does not implement the full SVG editor behavior. It focuses on a clean TypeScript project structure, explicit layering, and a minimal REPL that can be extended in later phases without structural churn.
