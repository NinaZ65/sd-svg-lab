# 报告修订前的代码抽查（2026-11-13）

检查起点为 `49c7a48`。先抽查代码并运行原有测试，再补两项针对历史状态的测试；随后才修订正式报告。运行代码未因本轮抽查改变。

## 1. 依赖与目录

执行 `node scripts/audit-dependencies.js`，结果为：

```text
Scanned 76 TypeScript source files and 229 literal module references.
Dynamic loads: 1 (only the generic ConfigLoader is permitted).
PASS: no dependency rule violations found by static inspection.
```

脚本从 TypeScript 语法树读取静态 import/export 和 require/import() 调用。核对领域层不引用宿主、插件、终端或文件系统；插件仅使用列明的公开 API 和自身包；VSCode 扩展不依赖 CLI；配置加载器不直接导入具体插件。另在内存中分别注入“领域层 → 宿主”“box → dir”“扩展 → CLI”三条错误依赖，三次检查均按预期失败，未把错误依赖写进仓库。

人工核对了 `BoxProvider` 经 `PluginContext.createShape()` 创建子部件；`DirCommand` 依赖 `DirectoryAccess`，Node 文件系统只在 `NodeDirectoryAdapter` 接入；`ConfigLoader` 按解析到的模块动态 require，没有插件名称映射。目录与方案的差异是沿用旧路径：`Command`/`CommandContext` 在 `src/commands/`，五种内置叶子类在 `src/model/shapes/`，公开的 `GroupShape` 也在其中。目录名不完全等于架构角色，详见报告的一致性自查。

历史接入差异也重新核验：

```bash
git diff --name-status 0fb561a^ 0fb561a
git diff --name-status 16b1237^ 16b1237
git diff --name-status 1162d7f^ 1162d7f
```

box 的代码装配只新增插件、修改 `CodeAssembly.ts` 并加入测试；配置装配只改配置与测试。tree-star 接入会修改顶层装配及配置，但对内核、树渲染命令和既有插件的差异为空。已核对相关父版本路径存在；不能用不存在的路径或误把顶层装配算作内核来证明“零改动”。

## 2. 代表性行为

| 抽查代码 | 检查的问题 | 结果与证据 |
|---|---|---|
| `PluginActivator`、`ConfigLoader` | 是否先暂存注册再校验；失败后是否继续启动；模块求值失败是否误报找不到模块 | 对照源码与 `test/plugin-loader.test.ts`、`test/plugin-options.test.ts`，已有测试通过。 |
| `SetCommand`、`AttributeTransaction` | 多个子部件已修改后抛错，能否整体恢复；是否破坏原有 redo | 新增 box 多部件失败测试，还重复修改同一 fill；全部恢复，原有 redo 仍可执行。 |
| `DirCommand`、`NodeDirectoryAdapter` | 成功/失败是否影响非空历史、dirty、SVG 路径及进程工作目录 | 新增测试先编辑两次再 undo；目录成功与失败后状态均保持，原 redo 仍能恢复正确值。 |
| `ModifiedStar` | 保存点、祖先传播、undo/redo 是否符合规约；状态是否在实例字段中 | 现有 `test/tree-star.test.ts` 通过；快照存于实例，无模块级 dirty 集合。 |
| SVG 文档符号提供者及解析器 | 起始标签范围与完整元素范围是否区分；编辑中不完整 XML 会否崩溃 | 11 项扩展测试通过，覆盖 LF/CRLF、多行、嵌套、无 id、实体、CDATA 和 Unicode。 |

本轮发现的是测试覆盖不足，没有复现运行代码的新功能错误。新增两项测试位于 `test/dir-plugin.test.ts` 和 `test/box-plugin.test.ts`，不是把“测试通过”写成“发现并修复 bug”。

## 3. 执行结果与边界

```text
npm test
  CLI: 54 passed, 0 failed
  VSCode extension: 11 passed, 0 failed
  CLI smoke + Phase 1 validation: success

node scripts/verify-transcripts.js
  PASS: final vs --no-plugins: cli-1.txt
  PASS: code vs config: cli-1.txt
  PASS: code vs config: box-session.txt
  PASS: code vs config: commands.txt
```

`npm test` 先编译两套 TypeScript 配置（均启用 strict），再运行测试；CLI 会话脚本从 `final` 的 Git 对象重建基线，用原始输出逐字节比较。目录相关测试使用替身和真实临时目录，避免依赖开发机当时的目录内容。

静态脚本不能证明动态别名、eval、任意插件副作用或全部运行行为；上面的源代码抽样和行为测试用于补充。没有计算覆盖率，也没有把圈复杂度视为正确性证明。CLI 与大纲解析器都只覆盖声明的 SVG 子集。

已有真实截图证明原版文件标记、大纲层级与源码定位。新摘要、图标和悬浮提示仍待新界面截图；本轮未声称重新进行了 VSCode 人工演示。抽查时尚未发布最终 tag，原本地候选 `p2` 指向 `92bf1f2`；最终交付状态见正式报告。
