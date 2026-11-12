# SVG 文件标记与原生大纲扩展

## 启动

在仓库根目录运行：

```bash
npm run build:vscode
code --new-window --extensionDevelopmentPath="$PWD/vscode-extension" "$PWD/vscode-extension/examples"
```

在新窗口的 Explorer 中查看 `example.svg` 右侧的 `[]`；打开该文件后，在 Outline 视图查看 `svg → g#flow → rect#start` 等层级，点击 `rect#start` 应定位到对应起始标签。修改 `id` 或增加图形后大纲应刷新；暂时删除闭合标签时大纲可清空，恢复后重新出现。目录与非 SVG 文件不带标记。

示例文件：[example.svg](examples/example.svg)。扩展源码在 `src/`，Node 验证在 `test/`。运行 `npm test` 可验证解析、更新、异常输入、标记文件类型以及符号定位范围。截图证据保存在仓库的 `doc/evidence/lab2/`，应由实际扩展开发窗口取得。

## API 与边界

扩展启动时注册 `FileDecorationProvider` 和 `DocumentSymbolProvider`，由 VSCode 在需要展示 Explorer 或 Outline 时回调。文件装饰只返回界面 badge，不修改文件。大纲提供带源代码范围的嵌套 `DocumentSymbol`，由 VSCode 完成视图绘制、点击定位和编辑后的重新请求。解析器只提取用于大纲的 XML 元素结构；不负责完整 SVG 校验、渲染或 CLI 模型构造。

由于此工作区的 npm 网络不可达，`types/vscode.d.ts` 只声明本扩展使用的稳定 API；运行时 `vscode` 模块仍由扩展宿主提供。接口可对照 [VSCode API 文档](https://code.visualstudio.com/api/references/vscode-api)。
