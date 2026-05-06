# Linear Issue 直读式多桌面 Agent 工作流 MVP

## 目标

这套 MVP 工作流不引入新平台。Linear 是唯一任务账本，Linear Issue 是任务本体。桌面 Agent 在各自项目 session 中直接读取 Issue，结合 IDE / repo / 历史上下文执行任务，并把状态、证据、风险直接回写到对应 Issue。

Hermes 不生成执行包，不作为桌面 Agent 和 Linear 之间的中转层。Hermes 的职责是 Issue 治理：帮助 Chris 创建、梳理、排序、巡检、审核和追踪 Linear Issue。

## 核心角色

| 角色 | 职责 | 不做什么 |
| --- | --- | --- |
| Chris | 提出目标、确认优先级、做最终验收 | 不维护每个 Agent 的执行细节 |
| Hermes | 梳理 Issue、巡检状态、辅助 In Review、跟踪 `Blocked` 任务 | 不生成必经执行包，不替 Agent 回写结果 |
| Desktop Agent | 直接读取 Linear Issue，在项目 session 中执行并回写证据 | 不私下找 Hermes 中转，不直接 Done |
| Linear | 承载任务、状态、评论、证据、风险、审核结论 | 不只是展示板，是唯一事实来源 |

## Linear 工作区配置

### 状态流转

沿用 Linear 现有标准状态，不新增自定义状态：

```text
Backlog -> Todo -> In Progress -> In Review -> Done
```

标准结束状态：

```text
Canceled
Duplicate
```

### 状态含义

| 状态 | 含义 | 允许推进者 |
| --- | --- | --- |
| Backlog | 想做但尚未整理成可执行任务 | Chris / Hermes |
| Todo | Issue 已具备目标、范围、验收标准、回填要求，可执行 | Chris / Hermes |
| In Progress | 桌面 Agent 正在处理 | Desktop Agent |
| In Review | Agent 已交付结果和证据，等待审核 | Desktop Agent |
| Done | 结果已确认，可沉淀或关闭 | Chris / Hermes |
| Canceled | 任务不再需要执行 | Chris / Hermes |
| Duplicate | 任务与其他 Issue 重复 | Chris / Hermes |

> 说明：此前文档中的 `Ready` 对应当前 Linear 的 `Todo`；`Verified` 对应当前 Linear 的 `Done`。阻塞不作为状态处理，统一通过 `Blocked` 标签和 Issue 评论表达。

### 标签

Infomili Team 使用三类标签。每个 Issue 都应尽量包含三项：需要什么角色处理、由哪个具体 Agent 处理、任务属于什么类型。

#### 角色标签

角色标签回答：这个任务需要哪类能力处理。

| 标签 | 用途 |
| --- | --- |
| `AI-Dev` | 开发、工程实现、代码修改 |
| `AI-Test` | 测试、验证、质量检查 |
| `AI-Design` | 设计、交互、视觉与体验 |
| `AI-Review` | 审核、复核、验收辅助 |
| `AI-Docs` | 文档、说明、规范、内容沉淀 |
| `AI-Ops` | 运维、发布、配置、自动化运行 |

#### 员工标签

员工标签回答：这个任务交给哪个具体 Agent 处理。

| 标签 | 用途 |
| --- | --- |
| `Agent-Codex` | Codex 桌面 Agent |
| `Agent-Cursor` | Cursor |
| `Agent-ClaudeCode` | Claude Code |
| `Agent-AntiGravity` | AntiGravity |
| `Agent-Bob` | Bob |
| `Agent-Oao` | Oao |

#### 任务类型

任务类型只保留少量高层分类。

| 标签 | 用途 |
| --- | --- |
| `Feature` | 新功能、新能力、新页面或新流程 |
| `Bug` | 缺陷修复、异常处理、回归问题 |
| `Improvement` | 优化、调整、重构、质量提升 |
| `Blocked` | 任何无法继续推进的任务，包括缺信息、缺权限、缺决策、需要人工 review、等待依赖 |

标签只用于筛选和路由，不替代 Issue 内容。`Blocked` 不写具体原因到标签名，原因必须写在 Issue 评论里。

### Project 信息

每个 Linear Project 至少维护这些默认信息：

```markdown
## Project Session
- 本地 repo / workspace:
- 默认桌面 Agent:
- 常用验证方式:
- 当前阶段:
- 重要限制:
```

桌面 Agent 的项目上下文主要来自它当前打开的 IDE / repo / session。Linear Project 只做入口提示，不需要复制完整项目说明。

## Issue Todo 标准

Issue 进入 Todo 前，必须具备：

- `Task` 不为空：说明要完成什么。
- `Scope` 不为空：说明做什么、不做什么。
- `Acceptance` 不为空：说明什么算完成。
- `Return Evidence` 不为空：说明完成后如何回写证据。

`Background` 可以为空，但如果任务有特殊背景，必须写在 Issue 中。

## 执行 SOP

### 1. 创建或梳理 Issue

Chris 可以直接创建粗粒度 Issue，Hermes 负责协助补齐：

- 任务目标
- 任务范围
- 验收标准
- 回填要求
- 推荐三类标签：角色标签、员工标签、任务类型

补齐后状态进入 `Todo`。

### 2. 桌面 Agent 读取 Issue

桌面 Agent 在对应项目 session 中读取 Linear Issue。它可以通过 Linear 插件、复制 Issue 内容、浏览器打开 Issue 等方式读取。

桌面 Agent 开始执行时：

- 将状态改为 `In Progress`
- 或评论“开始处理”，如果当前工具不能改状态

### 3. 执行与回写

Agent 完成后，在同一个 Issue 中写回结果，并将状态改为 `In Review`。

必须包含：

- 完成了什么
- 改了什么文件 / 链接 / 产物
- 如何验证
- 剩余风险
- 建议下一步

### 4. 阻塞处理

如果 Agent 无法理解或执行任务，不找 Hermes 私聊中转。它应直接在 Issue 中评论缺口，并执行以下动作之一：

- 添加 `Blocked`
- 保留在 `Todo`，或由 Hermes 退回 `Backlog`
- 明确列出缺少的信息、权限或决策

Hermes 巡检时补齐 Issue，补齐后重新进入 `Todo`。

### 5. In Review 与 Done

Chris / Hermes 在 Linear 中审核 `In Review` 状态的 Issue。

- 通过：改为 `Done`
- 不通过：评论原因，退回 `In Progress` 或 `Todo`
- 需要 Chris 或 Hermes 进一步判断：添加 `Blocked`，并在评论说明需要谁 review、卡点是什么

## 每日 Hermes 巡检

每天一次，Hermes 检查：

- `Backlog`：是否有可补齐并进入 Todo 的任务
- `Todo`：是否具备执行条件，是否同时具备角色标签、员工标签、任务类型
- `Blocked`：是否缺少信息、权限、决策、依赖或人工 review
- `In Review`：是否可由 Hermes 初审，是否需要 Chris 最终确认
- 长时间未更新任务：是否需要提醒或取消

输出给 Chris 的摘要格式：

```markdown
## 今日任务账本摘要

### Todo
- LIN-123: ...

### Blocked
- LIN-124: 缺少 ...

### In Review
- LIN-125: 建议通过 / 建议退回，原因 ...

### 建议动作
1. ...
2. ...
```

## 试点节奏

第一周只选 1 个真实项目试跑。

目标：

- 建立 5-10 个 Linear Issue
- 覆盖开发、研究、验证、文档任务
- 每个桌面 Agent 至少处理 1 个 Issue
- 每个任务都回写 Result / Changed / Verification / Risks / Next

一周后复盘：

- Issue 是否写得过轻
- Todo 标准是否有效
- 桌面 Agent 是否能仅凭项目 session + Issue 执行
- 回写证据是否足够审核
- 三类标签是否足够支撑角色、Agent 和任务类型分流

## 明确不做

- 不开发新任务系统
- 不让 Hermes 生成必经执行包
- 不让 Hermes 代替 Agent 回写结果
- 不做桌面 App 自动点击
- 不要求所有桌面 Agent CLI 化
- 不让 Agent 直接进入 Done
