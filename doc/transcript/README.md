# CLI 会话验收材料

输入文件 `cli-1.txt`、`box-session.txt`、`commands.txt` 只包含命令，不含 `svg>` 提示符或预期输出。`assets/other.svg` 是 Lab 1 读入会话的输入文件。`expected/` 保存从当前实现生成、去掉终端控制码后的可读输出；原始输出的逐字节对比由脚本直接在内存中完成。

在仓库根目录运行：

```bash
npm run build
node scripts/verify-transcripts.js
```

脚本从 Git 的 `final` 对象创建临时源码副本，编译后对比 `cli-1.txt` 在 `final` 与当前 `--no-plugins` 下的原始输出；随后对三组会话分别比较代码装配与配置装配的原始输出。每次执行使用临时工作目录；`dir` 的目录内容固定，日志不写入该目录。只有确实更改预期行为并经过审阅时才使用 `--update-expected` 更新可读输出。

Lab 1 要求文件中的会话展示了目标格式；本项目的基线判断依据是已有 `final` tag 的真实运行输出，因此可读输出保留了 Phase 1 实际的提示、树缩进与撤销反馈。
