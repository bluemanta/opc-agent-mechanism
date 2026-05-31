# AGENTS.md — bluemanta-opc 项目背景与定位

## 项目概述

本项目现名 **bluemanta-opc**，原名 **OPC Agent Mechanism**（One Person Company + AI Agent 协作机制）。新名称保留 OPC 方向，同时加入 Bluemanta 个人/组织标识。

### 新定位

这是一个**以任务管理为中心、协同多 Agent、多项目的任务自动化执行的本地化工作模式**，且未来将向更高程度的自动化方向发展。

### 核心理念

- **OPC (One Person Company)**：一个人运营的公司/团队，通过 AI Agent 扩展个人能力边界
- **Agent 协作**：不是单一 AI 助手，而是多个专职 Agent 协同工作（如开发 Agent、测试 Agent、文档 Agent、运营 Agent 等）
- **任务驱动**：以任务（Task）为最小管理单元，而非传统的项目-需求-工单层级
- **本地化运行**：工具链和 Agent 运行在本地环境，数据主权归用户所有
- **自动化优先**：从"人机协作"逐步演进到"自动执行"

---

## 解决的问题

### 1. 个人能力扩展问题
一个人无法同时专注多个领域（开发、设计、营销、运营），通过多 Agent 协作模拟一个完整团队。

### 2. 任务管理碎片化问题
传统项目管理工具（Linear、Jira、Notion）偏向团队协作，对 OPC 场景过度设计。需要一个轻量、任务为中心的管理模式。

### 3. Agent 协作缺乏标准
当前 AI Agent 各自为战，缺乏统一的任务分配、状态同步、结果汇总的协作机制。

### 4. 自动化执行断层
从"规划"到"执行"之间存在人工操作断层（如手动运行脚本、手动部署、手动测试），需要建立自动化的任务执行管道。

---

## 核心功能方向

### 阶段一：任务管理中枢
- 本地化任务管理（基于文件或轻量数据库）
- 任务状态流转（待办 → 进行中 → 已完成 → 已验证）
- 多项目上下文切换

### Linear 标签体系

当前 Infomili Team 的任务路由只保留三类标签：

- **角色标签**：说明任务需要哪类能力处理，例如 `AI-Dev`、`AI-Test`、`AI-Design`、`AI-Review`、`AI-Docs`、`AI-Ops`
- **员工标签**：说明交给哪个具体 Agent，例如 `Agent-Codex`、`Agent-Cursor`、`Agent-ClaudeCode`、`Agent-AntiGravity`、`Agent-Bob`、`Agent-Oao`
- **任务类型**：说明任务性质，仅保留 `Feature`、`Bug`、`Improvement`、`Blocked`

每个可执行 Issue 应尽量同时具备 1 个角色标签、1 个员工标签、1 个任务类型标签。所有无法继续推进的任务，包括缺少上下文、权限、决策、依赖或人工 review，都统一使用 `Blocked`；具体阻塞原因写在 Issue 评论中，不再拆分为多个阻塞原因标签。

### 阶段二：Agent 协作框架
- Agent 角色定义与注册
- 任务分配与调度逻辑
- Agent 间通信与结果传递

### 阶段三：自动化执行引擎
- 任务自动触发与执行
- 本地工具链集成（Git、终端、浏览器、API）
- 执行结果反馈与异常处理

---

## 技术栈参考

- **前端可视化**：HTML/CSS/JS（当前为方法论展示，未来可能升级为交互式管理界面）
- **任务数据**：JSON 配置文件驱动（`config.json`）
- **Agent 运行环境**：本地 CLI 工具 + API 集成
- **部署**：GitHub Pages（展示层），本地运行（执行层）

---

## 品牌与命名

项目正在重新命名，候选方向：
- 音乐/指挥隐喻：Maestro, Cadence, Harmony
- 生物/网络隐喻：Mycelium, Cortex, Symbiosis
- 航海/导航隐喻：Rudder, Compass, Keel
- 建筑/结构隐喻：Scaffold, Lattice, Blueprint
- 抽象/哲学隐喻：Telos, Logos, Nexus

**License**：CC BY-NC 4.0（非商用，禁止做教程/课程等商用行为，需书面授权）

---

## 研究与开发方向

如果你是研究本项目的 AI Agent（如 Codex），请关注以下方向：

1. **任务模型设计**：如何设计一个既简洁又足够表达力的任务数据结构？
2. **Agent 协作协议**：多个 Agent 如何高效协作而不产生冲突或重复工作？
3. **本地化执行方案**：如何在保证安全的前提下，让 Agent 自动执行本地命令和脚本？
4. **人机协作界面**：OPC 用户如何快速了解任务状态、干预执行、查看结果？
5. **可扩展性**：如何支持新 Agent 类型的动态注册和能力发现？

---

## 项目结构（当前）

```
bluemanta-opc/
├── index.html          # 主展示页面
├── data/config.json    # 数据配置文件
├── css/                # 样式文件
├── js/                 # 交互逻辑
└── AGENTS.md           # 本文件（项目背景与协作指南）
```

---

**最后更新**：2026-05-29
**维护者**：Chris Wang (wccshow@gmail.com)
**协作助手**：嘉怡 (Hermes Agent)
