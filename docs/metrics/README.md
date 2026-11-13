# 指标生成说明

在仓库根目录运行 `node scripts/generate-metrics.js final p2`，从 Git 对象生成 `summary.md`、`files-final.tsv` 和 `files-p2.tsv`。文件清单包含职责、分类行数和复杂度估算；CLI 按内核、装配处、插件拆分，VSCode 扩展单列，测试、依赖、构建产物和声明文件排除。

`p2` 尚未建立时，脚本暂用 HEAD 生成候选数据并在终端提示。源码提交后建立最终 tag，再执行同一命令，核对生成文件没有差异。

`files-HEAD.tsv` 是框架扩展点完成时的首次快照，`files-main.tsv` 是细节优化后的分支快照，保留供过程追溯。正式交付对比使用 `files-final.tsv` 与 `files-p2.tsv`。
