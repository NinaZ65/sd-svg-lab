# VSCode 实际运行证据

本目录存放本项目扩展开发窗口的真实截图，与 `doc/requests/lab2/docs/images/` 内的课程示意图分开。

运行 `npm run build:vscode` 后，按 `vscode-extension/README.md` 启动扩展开发窗口并打开 `vscode-extension/examples/`。用户在实际图形窗口保存了：

1. [vscode-svg-badge.png](vscode-svg-badge.png)：Explorer 中 `example.svg` 右侧有 `[]`，文件名未变。
2. [vscode-svg-outline.png](vscode-svg-outline.png)：Explorer 同时显示 `sample-dir/`、`example.svg` 和 `notes.txt`，只有 SVG 文件带标记；原生 Outline 展示嵌套层级与无 id 的 `text`，选中 `rect#start` 后源码定位到第 4 行 `<rect id="start" .../>`。

这两张截图共同证明文件标记、大纲层级与源码定位。编辑后更新和不完整 XML 的安全处理由 `vscode-extension/test/` 中的提供者测试验证；当前执行环境无法访问图形显示，故不把未亲眼观察的交互写作人工验证结果。
