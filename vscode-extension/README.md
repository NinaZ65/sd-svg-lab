# SVG 文件标记与原生大纲扩展

## 启动

在仓库根目录运行：

```bash
npm run build:vscode
code --new-window --extensionDevelopmentPath="$PWD/vscode-extension" "$PWD/vscode-extension/examples"
```

示例工作区的 `.vscode/settings.json` 将 `*.svg` 默认关联到文本编辑器；打开窗口后如仍停留在已打开的图片预览标签，请关闭该标签，再从 Explorer 打开 `example.svg`。也可以在图片预览标签上右键，执行“使用其他编辑器重新打开 / Reopen Editor With”，将 `*.svg` 的默认编辑器设为“文本编辑器 / Text Editor”。

在新窗口的 Explorer 中查看 `example.svg` 右侧的 `[]`；同目录的 `notes.txt` 与 `sample-dir/` 不带标记。在 SVG **源码编辑器**里，在资源管理器下方的“大纲 / Outline”视图查看 `svg → g#flow → rect#start` 等层级；如果视图没显示，可在命令面板执行 `View: Open View` 并选择 Outline。点击 `rect#start` 应定位到第 4 行的 `<rect id="start" .../>` 起始标签。修改 `id` 或增加图形后大纲应刷新；暂时删除闭合标签时大纲可清空，恢复后重新出现。

示例文件：[example.svg](examples/example.svg)。扩展源码在 `src/`，Node 验证在 `test/`。运行 `npm test` 可验证解析、更新、异常输入、标记文件类型以及符号定位范围。截图证据保存在仓库的 `doc/evidence/lab2/`，应由实际扩展开发窗口取得。

示例是一张“提交—审核—完成”的内容发布流程图：三个步骤统一为 160 × 64 的圆角框，相隔 100 个源码坐标单位，分别以蓝、橙、绿表示输入、处理和完成；编号与文字同时表达步骤，避免仅靠颜色识别。`g#next` 内嵌 `g#result`，步骤文字有意不设 id，用同一份材料演示嵌套、无 id 节点、尺寸和文字摘要。`rect#start` 保留在第 4 行，点击定位仍易于核对。根元素的 title、desc 提供图形的文字说明。

## API 与边界

点击大纲节点时，提供给 VSCode 的 `selectionRange` 覆盖该元素的完整起始标签，多行属性也在范围内；`range` 保留整个元素及其子树，使容器的归属范围完整。实体解码和文字摘要不会改变源码偏移。实际选中及滚动效果由 VSCode 的原生导航处理。

扩展启动时注册 `FileDecorationProvider` 和 `DocumentSymbolProvider`，由 VSCode 在需要展示 Explorer 或 Outline 时回调。文件装饰只返回界面 badge，不修改文件。大纲提供带源代码范围的嵌套 `DocumentSymbol`，由 VSCode 完成视图绘制、点击定位和编辑后的重新请求。解析器只提取用于大纲的 XML 元素结构；不负责完整 SVG 校验、渲染或 CLI 模型构造。

由于此工作区的 npm 网络不可达，`types/vscode.d.ts` 只声明本扩展使用的稳定 API；运行时 `vscode` 模块仍由扩展宿主提供。接口可对照 [VSCode API 文档](https://code.visualstudio.com/api/references/vscode-api)。
