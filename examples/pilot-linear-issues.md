# Pilot Linear Issues

用以下 8 个 Issue 作为第一周试点样例。实际创建到 Linear 时，每个 Issue 都应使用 `templates/linear-issue-template.md`。

## 1. 修复一个明确 Bug

```markdown
## Labels
- Role: AI-Dev
- Agent: Agent-Codex
- Type: Bug

## Task
修复页面在 GitHub Pages 上读取旧 config 时出现白屏的问题。

## Background
线上曾出现 Cannot read properties of undefined 的错误，需要确保脚本对旧配置有兼容。

## Scope
做：增加数据兜底和缓存版本号。
不做：重构整个渲染系统。

## Acceptance
旧版 config 和新版 config 都能渲染页面，不出现白屏。

## Return Evidence
回填改动文件、验证方式、剩余风险。
```

## 2. 新增 Issue 校验工具

```markdown
## Labels
- Role: AI-Dev
- Agent: Agent-Codex
- Type: Feature

## Task
实现一个本地脚本，检查 Linear Issue Markdown 是否包含必填章节。

## Background
MVP 要求 Todo Issue 至少包含 Task、Scope、Acceptance、Return Evidence。

## Scope
做：支持读取文件或 stdin。
不做：调用 Linear API。

## Acceptance
缺章节或章节为空时返回非 0；完整模板返回 0。

## Return Evidence
回填脚本路径、通过/失败样例命令。
```

## 3. 比较桌面 Agent 适用任务

```markdown
## Labels
- Role: AI-Review
- Agent: Agent-ClaudeCode
- Type: Improvement

## Task
比较 Codex App、Cursor、Claude Code Desktop、AntiGravity 分别适合的任务类型。

## Background
试点需要验证不同桌面 Agent 的分工。

## Scope
做：基于实际使用经验整理表格。
不做：做官方功能调研。

## Acceptance
输出每个 Agent 的 best for、weak for、handoff 建议。

## Return Evidence
回填结论、建议的角色/员工/任务类型标签、需要继续验证的问题。
```

## 4. 审核一个 Agent 回填

```markdown
## Labels
- Role: AI-Review
- Agent: Agent-Oao
- Type: Improvement

## Task
审核一个已进入 In Review 的 Issue，判断是否可以 Done。

## Background
需要验证 In Review -> Done 的操作规范。

## Scope
做：检查 Result、Changed、Verification、Risks、Next 是否完整。
不做：重新实现任务。

## Acceptance
给出通过或退回判断，并说明原因。

## Return Evidence
回填审核结论和状态建议。
```

## 5. 编写项目 Profile

```markdown
## Labels
- Role: AI-Docs
- Agent: Agent-ClaudeCode
- Type: Feature

## Task
为试点项目补充 Linear Project Profile。

## Background
桌面 Agent 主要依赖项目 session，但 Linear Project 需要提供入口提示。

## Scope
做：填写 repo、默认 Agent、验证方式、当前阶段、限制。
不做：复制完整项目文档。

## Acceptance
Project Profile 可帮助 Agent 确认自己打开的是正确项目。

## Return Evidence
回填 Profile 内容位置和待补充项。
```

## 6. 模糊任务处理

```markdown
## Labels
- Role: AI-Review
- Agent: Agent-Oao
- Type: Blocked

## Task
优化这个项目的协作体验。

## Background
无。

## Scope
待补充。

## Acceptance
待补充。

## Return Evidence
完成后直接回填：变更摘要、文件/链接、验证结果、风险。
```

期望 Agent 行为：不要执行，评论缺少范围和验收标准，保留在 Todo 或退回 Backlog，并使用 `Blocked`。

## 7. 小型 UI 调整

```markdown
## Labels
- Role: AI-Design
- Agent: Agent-Cursor
- Type: Improvement

## Task
调整架构图中桌面 Agent 回写 Linear 的箭头方向。

## Background
当前图容易误解为 Agent 回写 Hermes。

## Scope
做：箭头明确指向 Linear。
不做：重做全站视觉。

## Acceptance
读者能看出桌面 Agent 完成后直接回写 Linear Issue。

## Return Evidence
回填截图或说明、改动文件、验证方式。
```

## 8. 一周复盘

```markdown
## Labels
- Role: AI-Review
- Agent: Agent-ClaudeCode
- Type: Improvement

## Task
复盘第一周 Linear Issue 直读式工作流。

## Background
需要判断是否进入 v0.3 Issue 质量治理阶段。

## Scope
做：统计 Issue 清晰度、Blocked 原因、回填质量、Agent 适配度。
不做：开发自动执行引擎。

## Acceptance
输出保留项、调整项、下一周试点建议。

## Return Evidence
回填复盘结论和建议修改的模板字段。
```
