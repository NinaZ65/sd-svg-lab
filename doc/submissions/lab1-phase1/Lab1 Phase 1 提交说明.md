# Lab1 Phase 1 提交说明
*24302010060 张玳瑗*

## 代码仓库

GitHub：

https://github.com/NinaZ65/sd-svg-lab

最终提交版本使用 Git tag：

`final`

## 项目概要

本项目实现了一个 **CLI 版 SVG 编辑器**，通过命令行完成 SVG 文档的创建、读取、保存和基础编辑操作。

目前支持的主要功能包括：

- SVG 文档创建、读取与保存
- `rect`、`circle`、`ellipse`、`line`、`text`、`g` 等基础图形
- 图形创建、删除、移动、缩放和属性修改
- 图形分组、解组和容器调整
- 图形层级结构查看
- `undo / redo`
- 基本错误处理与状态恢复

项目使用 TypeScript 实现，并采用面向对象设计。

架构上主要使用了：

- **Command Pattern**：统一封装编辑操作，并支持撤销与重做
- **Composite Pattern**：统一处理普通图形与 `Group`
- **Factory Pattern**：集中管理不同 SVG 图形类型的创建

项目代码按照 CLI、Command、Model、History、IO 等职责划分，核心 Model 不依赖命令行交互层。

## 开发与验证

项目使用 Git 进行全过程版本管理，提交历史保留了从项目骨架、功能实现、测试补充到后续 bug 修复和架构调整的过程。

最终版本经过：

- TypeScript 编译检查
- CLI 冒烟测试
- Phase 1 功能测试
- Model / Command 自动测试
- 人工 CLI 验收

最终自动测试结果为：

- Node.js 测试：32 项通过，0 失败
- CLI 测试脚本执行成功

更详细的架构说明、AI 协作过程、一致性自查和质量保证记录见：

`doc/README.md`

