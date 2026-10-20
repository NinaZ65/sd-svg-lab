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
- The early project skeleton did not yet include the full Phase 1 command set and some serializer typing details needed cleanup.
- Those issues were corrected in the follow-up incremental pass without broadening beyond the course phase boundary.

---

## 2026-10-14 — Core Phase 1 command layer and documentation alignment

### Goal
Complete the CLI command layer required by the Phase 1 course specification and align the architecture docs with the actual implementation.

### Implementation content
- Registered the missing Phase 1 commands in [src/cli/CommandRegistry.ts](src/cli/CommandRegistry.ts): read, save, front, back, scale.
- Added the `ScaleCommand` to support positive scaling for shapes and nested groups.
- Updated [src/commands/HelpCommand.ts](src/commands/HelpCommand.ts) to list the expected command set.
- Corrected the serializer typing issue in [src/model/Document.ts](src/model/Document.ts) so the tree model compiles cleanly.
- Refreshed [doc/README.md](doc/README.md) and kept [doc/DESIGN_DECISIONS.md](doc/DESIGN_DECISIONS.md) consistent with the actual design choices.

### Design judgment
This increment keeps the architecture in the intended direction: tree-first model, command-based dispatch, and only minimal extension beyond the phase boundary.

### Verification
We verified the project still passes the TypeScript build and smoke validation with:
- `npm test`

The command layer is now aligned with the core Phase 1 CLI scope without introducing a second authoritative index or broad speculative features.

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

---

## 2026-10-14 — Git 状态误判与人工核验

### 事实回顾
AI 曾一度根据 `git push` 的终端输出，判断完整 Phase 1 实现已经同步到远端。随后人工检查 GitHub 后发现，远端仍然只保留了早期 skeleton 的 commit 历史。

### 重新验证
随后我们通过以下方式重新核验：
- `git rev-parse HEAD`
- `git rev-parse origin/main`
- `git status`
- `git log`
- 对关键文件内容进行直接检查

### 结论
最终确认：完整实现实际上仍然只是当前 working-tree 的修改，还没有进入任何 commit；因此之前关于“push 已完成”的结论是错误的。

后续我们改为采用“commit 状态 + remote-tracking ref + working tree”三者交叉确认的方式，而不再只依赖一次 `git push` 输出。

---

## 2026-10-20 — 补记最终人工 CLI 验收中的 create-in parent 修正

本节根据接手时提供的真实开发过程及提交 `a0105ab`（2026-10-15）补记，不改写前面的历史条目。

此前自动测试全部通过，但最终人工 CLI 执行 `create g flowchart`、`create rect r1 ... in flowchart`、`show r1` 时，发现实际 parent 仍是 root。定位到 `CreateCommand` 未把实际插入及历史操作绑定到指定父容器后，修正了 `targetParent` 的选择；同时给 `test/phase1-validation.ts` 增加 rect/text 的 in 场景和 `parent=g#flowchart` 断言。修复后执行 `npm test` 并重新验收真实 CLI。

本次又用真实 CLI 进程重放该场景，确认输出 `rect#r1 parent=g#flowchart`。已有测试绿只覆盖原有断言，人工交互和有针对性的回归测试仍然必要。

---

## 2026-10-20 — 最终审计、失败测试与命令状态安全修复

### 发现与先行失败证据

接手时 `HEAD/main/origin/main/final` 均为 `5d7ab2a`，working tree clean。最初只读审计发现两项真实 bug，随后先加入测试、构建并执行：

```bash
npm run build
node --test dist/test/group-state.test.js dist/test/set-history.test.js
```

未修复实现的结果为 9 项中 7 失败、2 通过。关键失败证据：

- `group bad r1 missing` 已输出错误，但 r1 被摘进未挂接的 bad，原 parent、sibling order、tree/SVG 不再相同；测试还检查 r2、bad 不存在及历史深度。
- `set r1 x 5 → undo → redo` 第一次 redo 后得到 0 而非 5；独立连续 set 的历史及反复撤销重做也失败。
- group 跨父节点、非顺序选择后 undo，部分 sibling 恢复位置不正确；祖先/后代及重复目标场景也暴露了边检查边修改的问题。

### 定位与修复

- GroupCommand 原先在遍历目标时即 `removeChild`。现先确认新 id、全部目标、原 parent/index、重复目标、非法祖先/后代关系；全部通过才修改。Undo 按各父节点原 index 升序恢复，redo 复用稳定目标记录，不采用失败后回滚。
- SetCommand 原 setter 同时更新 oldValue/nextValue，undo 会覆盖 redo 所需值。现先确定属性写入操作，固定捕获 previousValue/nextValue，undo/redo 仅写值；支持恢复未设置的可选样式，并在写入前拒绝非法数值。
- 失败测试与对应修复合并为通过测试的逻辑提交，未为保留红灯记录而提交破坏 `npm test` 的版本。上述先行运行结果在此如实记录。

### 相似命令的定向复查

检查 move/scale/delete/create/group/ungroup/addto/front/back 的闭包载荷、原 parent/index 及失败后的状态。新增 `command-history.test.ts`，先运行时 16 项中 6 失败、10 通过：

- addto 同父节点移动后 redo 未先移除旧位置，产生重复引用；同时未拒绝 self/descendant/root 结构。现完整预验证后移动，redo 始终先从活动 parent 摘除。
- ungroup 原先把 children 追加到 parent 末尾，且把根级容器误判为可解散。现按原 groupIndex 插入 children，redo 使用相同操作；执行前拒绝根级容器。
- move/scale/delete/create/front/back 的本轮重复 undo/redo 场景未发现同类载荷覆盖，不为防范假设风险改写这些结构操作。group 的多父节点恢复也由测试保护。

### 最小架构一致性修正

- `Document.createShape()` 委托 `ShapeFactory.fromSvg()`，SVG 参数转换与 CLI 创建复用工厂的 type → class 映射，移除 Document 的第二套创建分派。
- 六种内置图形嵌套 round-trip 测试先发现 line 端点读回为 0；定位到原属性名正则不接受数字，随后仅修正该正则，确保 `x1/y1/x2/y2` 被读到。未知标签及缺省样式行为继续测试。
- Shape 增加多态 move/scale，Group 负责递归，leaf 负责几何；Move/ScaleCommand 不再导入或判断具体类型。`captureGeometry()` 保存目标子树的局部几何恢复闭包，避免用反向浮点运算导致精度漂移，不复制完整 Document。
- 新增 Composite 测试涵盖全部叶子类型、嵌套/空 Group、无关 sibling，以及 10 轮精确 undo/redo。不扩展为插件框架、通用属性系统或序列化重构。

### 验证与文档

- `npm test` 统一执行 build、CLI smoke、phase1-validation 和所有 `*.test.js`，将原 `model-tree.test.ts` 纳入；该测试仅操作内存，无文件/进程副作用。
- 各提交前后完整 `npm test` 通过。最终本轮代码测试：Node test runner 32 项通过、0 失败，另两个 CLI 脚本成功。
- 用实际 CLI 进程额外复验：group 失败前后 r1/r2 均存在且 parent 为 root；set 的 undo 为 0、redo 为 5，重复操作不漂移；create-in 的 parent 为 flowchart。
- 人工检查 Model import、CommandContext、CommandRegistry、Factory 委托、Document 树查找及 Composite 实现；README 用具体抽查及四类未来变化/风险替代笼统符合结论，并明确未覆盖场景。
- DESIGN_DECISIONS 的 Map 当前张力表述已更新为历史问题已解决，同时如实保留序列化/set 类型知识和输出耦合等剩余边界。

### 发布约束

保留所有既有 commits，不 rebase/squash/force push。本轮按功能修复、工厂集中化、Composite 变换及文档分步新增提交；代码及文档完成后普通 push main，再交叉核对 HEAD、origin/main、working tree 及 final。`final` 保留在 `5d7ab2a`，待用户审阅明确确认后才移动。
