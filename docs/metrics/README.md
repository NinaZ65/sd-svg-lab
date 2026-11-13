# 指标生成说明

`summary.md` 与文件清单由仓库根目录的 `scripts/generate-metrics.js` 从 Git 对象生成。默认比较 `final` 与 `p2`；当 `p2` 不存在时暂用 HEAD，脚本在摘要中明确实际读取的引用。指标只读取 `.ts` 源码文件，排除测试、依赖、构建产物与声明文件；VSCode 扩展单列。

2026-11-13 的界面细节优化后，当前摘要使用 `node scripts/generate-metrics.js final main` 生成，对应 `files-final.tsv` 与 `files-main.tsv`。CLI 源码未改变，VSCode 扩展的增量单独更新。现有本地 `p2` 仍指向优化前提交，按用户要求不移动或发布，因此不能用它代表本轮源码。

`files-HEAD.tsv` 保留框架扩展点完成时的首次快照；`files-p2.tsv` 保留现有本地 `p2` 的历史快照。两者均不冒充当前分支数据。后续正式交付的 tag 安排由用户另行决定。
