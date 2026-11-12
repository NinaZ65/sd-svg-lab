# 指标生成说明

`summary.md` 和两个 `files-*.tsv` 由仓库根目录的 `scripts/generate-metrics.js` 从 Git 对象生成。默认比较 `final` 与 `p2`；在 `p2` 尚未打 tag 的收尾阶段，脚本使用当时的 HEAD 源码树生成候选 `p2` 数字。最终打 tag 后再次运行脚本核对。指标只读取 `.ts` 源码文件，排除测试、依赖、构建产物与声明文件；VSCode 扩展单列。

`files-HEAD.tsv` 是框架扩展点完成时首次产出的过程快照，保留用于追溯，不作为最终 `p2` 指标。正式文件清单为 `files-final.tsv` 与 `files-p2.tsv`。
