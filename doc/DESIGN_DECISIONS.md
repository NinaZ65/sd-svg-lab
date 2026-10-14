# Design Decisions

This document records the concrete decisions made under the constraints of the course requirement in [phase_cli_1.md](phase_cli_1.md). It does not replace the course specification; it only defines how the project will resolve choices that are intentionally left open by the assignment.

The core rule is simple:

- [phase_cli_1.md](phase_cli_1.md) defines what must be implemented.
- This document defines how we will implement it when there is more than one acceptable design choice.
- We must not weaken or reinterpret the course semantics in order to simplify the code.

---

## 1. Group uses the Composite design

### Decision
Group is not treated as a separate special-case container type. It is part of the same Shape abstraction as leaf nodes.

The intended model is:

```text
Shape
├── Rect
├── Circle
├── Ellipse
├── Line
├── Text
└── Group
```

with:

```text
Group has children: Shape[]
```

Calling code should operate on a uniform interface instead of branching on a type check like:

```ts
if (shape is Group) { ... }
else { ... }
```

### Reason
- It matches the nested and tree-like structure of SVG itself.
- It satisfies the Composite semantics required by the course.
- It reduces type-driven branching in the calling layer.
- It creates a clean foundation for future composite shapes such as box-style plugins.

### Implementation constraints
- Child operations such as move, scale, delete, and traversal must be expressed through polymorphic behavior.
- Group must propagate recursive operations to its children when appropriate.
- Non-recursive operations remain valid for leaf shapes.

### Future adjustment conditions
If a later phase reveals that recursive propagation is not sufficient for certain operations, the Group contract may evolve, but the general Composite principle remains the boundary we will not cross.

---

## 2. id lookup uses tree traversal for now, not a second global index

### Decision
The project will use document.findById(id) or equivalent tree traversal to locate an element from the SVG structure itself.

We will not maintain a separate authoritative Map<string, Shape> for the current phase unless a real performance problem is demonstrated.

### Reason
- The SVG document is naturally a tree.
- The current project is small and correctness matters more than lookup optimization.
- A second index would require synchronization with create, delete, group, ungroup, read, and undo/redo logic.
- This complexity is not justified in Phase 1.

### Implementation constraints
- id uniqueness must still be enforced rigorously.
- The tree remains the primary source of truth.
- If a future phase adds a lookup cache, it must be treated as an auxiliary index and not as a second authority.

### Future adjustment conditions
This may be re-evaluated only if real performance tests or scale analysis show that traversal becomes a bottleneck. The index must then be documented as a cache with a clear consistency policy.

---

## 3. Undo/Redo stores the minimal necessary reverse information

### Decision
The project will use the Command Pattern, but not by deep-copying the entire document for every command.

Instead, each command should store the minimal state needed to reverse itself.

Examples:

```text
MoveCommand
- target
- dx
- dy
```

```text
SetCommand
- oldValue
- newValue
```

```text
DeleteCommand
- deletedShape
- originalParent
- originalIndex
```

### Reason
- This keeps the design aligned with the responsibilities of Command.
- It avoids unnecessary mass snapshot copying.
- It exposes the exact reversal logic in each command instead of burying it in a document clone.

### Implementation constraints
- Commands must know how to undo themselves using the recorded state.
- The undo payload should be as small as possible while still preserving correctness.
- A command may keep local state beyond the immediate target if that is necessary for a correct reverse action.

### Future adjustment conditions
If a command proves too complex to reverse without more context, then the command may record a minimal local snapshot. However, full-document deep copies remain a fallback and not the preferred design.

---

## 4. Structural operations restore parent and sibling index

### Decision
Any operation that changes the tree structure, including delete, group, ungroup, addto, front, and back, must preserve the original parent and sibling index information when undoing.

This includes storing:

```text
originalParent
originalIndex
```

for affected elements.

### Reason
- SVG child order is semantically meaningful and impacts z-order.
- The course requires correct structural semantics.
- A naive undo that restores only the elements but not the positions in the parent can reorder siblings incorrectly.

### Implementation constraints
- Every structural mutation command must record the original structural location of affected elements.
- Undo must restore both the parent relationship and the sibling order.
- The command should check that the order is exactly restored, not just that the elements are present.

### Future adjustment conditions
If later phases introduce more complex container semantics, the recording format may become richer, but the restoration of parent and index remains mandatory.

---

## 5. All mutating operations follow validate-before-mutate

### Decision
Before any mutation happens, an operation must validate that the full requested action is legal in the current document state.

The flow is:

```text
validate
→ confirm the whole command is legal
→ mutate
```

### Reason
- The course explicitly says that failing commands must not change any state.
- A partial mutation followed by a later failure creates inconsistent structure and hidden bugs.
- This is especially important for group operations, cross-parent moves, and ID conflicts.

### Implementation constraints
- Validation must check all prerequisites before any mutation is applied.
- If validation fails, the document must remain byte-for-byte equivalent to its pre-command state as far as the model is concerned.
- The validation logic belongs to the command/model layer, not the parser.

### Future adjustment conditions
If the project later adds richer validation with richer error reporting, the same principle remains in force: validate first, mutate second.

---

## 6. Parser handles syntax, not document semantics

### Decision
The parser is responsible for turning input text into a structured command request. It is not responsible for checking the stateful validity of a command against the current SVG document.

Examples of parser responsibilities:
- tokenizing input
- parsing numeric literals
- decoding quoted strings
- identifying the command name and arguments
- recognizing syntactic forms such as in <containerId>

Examples of model responsibilities:
- checking whether a given id already exists
- checking whether the target id exists
- checking whether the target is a container
- checking whether a group would create a cycle

### Reason
- The parser should understand text structure, not live document state.
- This keeps responsibilities clean and reduces coupling.
- It is easier to test and extend.

### Implementation constraints
- The parser may fail on malformed syntax.
- It must not try to enforce document integrity rules.
- All stateful validation belongs to the command layer or the document model.

### Future adjustment conditions
If a later refactor introduces a richer command grammar or AST layer, the same separation remains valid.

---

## 7. Shape creation is centralized in a ShapeFactory

### Decision
The mapping from type name to concrete shape implementation must be centralized.

Examples of built-in types in Phase 1:
- rect
- circle
- ellipse
- line
- text
- g

The project will not scatter type-to-class logic across CLI, command, and model code.

### Reason
- It creates a single explicit location for type dispatch.
- It isolates the evolution point where new shape kinds are added.
- It leaves a clear path toward plugin-based shape registration later.

### Implementation constraints
- A single factory or equivalent factory entry point should create the appropriate concrete shape.
- The project may still keep a small centralized dispatch table in that factory.
- This is an accepted local exception to the general rule against type-based branching because it is a clearly identified change point.

### Future adjustment conditions
When plugin support is added, this factory can be replaced or extended by a provider/registry mechanism without altering the rest of the model interface.

---

## 8. Command name dispatch is centralized

### Decision
The mapping from command name string to the concrete command implementation should be centralized in the CLI command registry or equivalent dispatcher.

Examples:
- create
- move
- delete
- tree
- help
- exit

### Reason
- This is the approved command-dispatch location and is explicitly allowed by the course.
- It avoids command logic being embedded throughout the codebase.
- It creates a simple and extension-friendly command registration pattern.

### Implementation constraints
- The registry is the only place that maps command names to handler objects.
- The actual command logic remains inside command classes, not in the dispatcher body.

### Future adjustment conditions
The registry can evolve into a richer command table or provider registry as the CLI grows, as long as the dispatch remains centralized and explicit.

---

## 9. I/O and the core model are separated

### Decision
The SVG document model does not directly depend on terminal I/O, file-system details, or the Node CLI runtime.

I/O concerns are isolated in modules such as:
- console input
- console output
- read/write adapters
- file-based serialization logic

### Reason
- This keeps the model independent and testable.
- It prevents CLI concerns from polluting the business logic.
- It makes future read/save and parser work easier to isolate.

### Implementation constraints
- The model is responsible for document behavior, not terminal interaction.
- The CLI may call into commands and model objects, but the model will not reach back into CLI-specific code.

### Future adjustment conditions
This split can become more elaborate in later phases, but we maintain the same principle: technical adapters sit at the boundary, not inside the model.

---

## 10. No speculative over-engineering

### Decision
Although the course points toward future plugin and composite capabilities, the project will not build large infrastructure for hypothetical features before they are needed.

The current project will not introduce:
- a full plugin manager
- dependency injection container
- service locator framework
- event bus
- broad repository abstraction
- generalized runtime registry before the project genuinely needs it

### Reason
- The goal of Phase 1 is to establish a correct and extendable skeleton.
- Early over-engineering increases complexity without solving an immediate problem.
- The course specifically expects a clean structure and a stable path for future extension, not a premature framework.

### Implementation constraints
- The project should deliberately leave narrow extension points at real change points such as shape creation, command dispatch, and tree structure handling.
- It must not add heavy infrastructure where no concrete requirement exists yet.

### Future adjustment conditions
When the project actually reaches the plugin phase or a real performance issue, those infrastructure choices can be introduced with evidence and a documented rationale.

---

## 11. Project-level working rule

This project is expected to evolve in small, verifiable increments. Each increment must remain consistent with the requirements from [phase_cli_1.md](phase_cli_1.md) and with the decisions above.

When a new feature is introduced, we will:
1. check the course requirement,
2. check this design document,
3. build the smallest valid implementation,
4. verify it with the relevant checks,
5. record the work in [WORKLOG.md](WORKLOG.md).

---

## 12. Current known design tension

At the time of this document, one known difference exists between the preferred architecture and the current implementation:

- The document model currently contains a Map-based index in its implementation.
- This is a local compromise that can be convenient for quick lookup, but it conflicts with the preferred design for this project phase.

This is recorded here as a known issue, not as a silent architectural violation. The plan is to treat this as a tracked constraint and resolve it only when the project reaches a phase where the trade-off is justified, or when a later refactor is explicitly requested.
