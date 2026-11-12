# VSCode 实际运行证据

本目录存放本项目扩展开发窗口的真实截图，与 `doc/requests/lab2/docs/images/` 内的课程示意图分开。

运行 `npm run build:vscode` 后，按 `vscode-extension/README.md` 启动扩展开发窗口并打开 `vscode-extension/examples/`。请保存：

1. `vscode-svg-badge.png`：Explorer 同时显示 `example.svg`、`notes.txt` 和 `sample-dir/`，只有 SVG 文件右侧有 `[]`。
2. `vscode-svg-outline.png`：打开 `example.svg`，展开原生 Outline，点击 `rect#start`，截图同时显示嵌套大纲和定位到源码起始标签的位置。

还应在开发窗口里先观察 VSCode 原有 Outline 的展开与点击行为，再对比扩展提供的 SVG 节点；修改 id、暂时删掉闭合标签并恢复，确认更新和异常输入不会使扩展崩溃。记录观察结果时只报告实际看到的行为。当前执行环境无法访问图形显示，因此上述界面观察与截图尚待完成。
