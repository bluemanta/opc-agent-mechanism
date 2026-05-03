# OPC Agent Mechanism - 项目方案说明

> **Version**: v0.1 (MVP)  
> **Date**: 2026-05-03  
> **License**: CC BY-NC 4.0 (非商用)

---

## 🎯 项目背景

在 AI Agent 技术快速发展的今天，一人公司（OPC, One Person Company）可以通过与多个 AI Agent 协作，实现接近团队的工作效率。

**核心问题**：如何高效管理多个 AI Agent，避免混乱？

**解决方案**：以 **Linear** 为中央调度平台，建立标准化的 OPC + Agent 协作机制。

---

## 🏗️ 系统架构

```
[Chris OPC] → [嘉怡 PM Agent] → [Dev/Test/Design Agents] ↔ [Linear 中台]
```

### 角色定义

| 角色 | 名称 | 职责 |
|------|------|------|
| **OPC** | Chris Wang | 制定战略、审核结果、唯一人类用户 |
| **PM Agent** | 嘉怡 | 制定规范、创建标签、审计合规、协调 Agent |
| **Dev Agent** | Bob, Alice... | 开发功能、修复 Bug、提交 PR |
| **Test Agent** | - | 执行测试、报告 Bug、验证修复 |

### 核心原则

1. **唯一人类**: Linear 中所有任务的 Assignee 均为 Chris（唯一真实用户）
2. **Linear 中心**: 所有交互通过 Linear API 直接进行，无中间层
3. **标签驱动**: 使用员工标签（如 `Dev-Bob`）精确分配任务
4. **Agent 直连**: 各 Agent 通过独立 API Key 调用 Linear API
5. **PM 监督**: 嘉怡负责审计 Agent 合规性

---

## 🏷️ 标签体系

### 三层结构

1. **🎭 角色标签**（通用）: `AI-Dev`, `AI-Test`, `AI-Design`, `AI-Review`, `AI-Docs`, `AI-Ops`
2. **👤 员工标签**（精确）: `Dev-Bob`, `Dev-Alice`, `Test-Bob`...
3. **📋 任务类型**: `Bug`, `Feature`, `Improvement`, `Needs-Human-Review`, `Agent-Blocked`, `Auto-Generated`

### 命名规则

- **员工标签**: `{角色}-{Agent名称}`（如 `Dev-Bob`）
- **用途**: 精确控制"这个任务给谁"，查询简单

---

## 🔄 任务生命周期

```
[Backlog] 
   ↓ (PM 排期)
[Todo] + Dev-Bob
   ↓ (Agent 开始)
[In Progress] + Dev-Bob
   ↓ (Agent 完成)
[In Review] + Dev-Bob + Needs-Human-Review
   ↓ (Chris 审核)
[Done] + Dev-Bob
```

### 状态流转规则

| 当前状态 | Agent 可更新到 | 人工审核后可到 | 触发条件 |
|---------|--------------|--------------|---------|
| Backlog | Todo | - | PM 排期 |
| Todo | In Progress | - | Agent 开始工作 |
| In Progress | In Review | - | Agent 完成开发 |
| In Review | - | **Done** | **Chris 审核通过** |
| In Review | In Progress | - | 审核不通过，需修改 |
| Any | Blocked | - | Agent 遇到阻塞 |

**重要限制**:
- ❌ Agent **无权**将状态改为 Done
- ✅ 完成开发后，状态改为 In Review
- ⚠️ 必须添加 `Needs-Human-Review` 标签

---

## 📝 Agent 评论格式标准

所有 Agent 评论**必须**遵循以下格式：

```markdown
🤖 **{Agent名称}** 更新 (YYYY-MM-DD HH:MM)

**状态**: {进行中/已完成/被阻塞}
**进度**: {XX%}
**详情**: {描述}

**相关链接**:
- PR: {URL}
- 日志: {URL}
```

**示例**:
```markdown
🤖 **Bob** 更新 (2026-05-03 14:30)

**状态**: 已完成
**进度**: 100%
**详情**: AI BOSS 核心功能已实现，代码已提交审查

**相关链接**:
- PR: https://github.com/org/repo/pull/123
```

---

## 🚫 禁止事项

1. **禁止** Agent 将状态改为 Done
2. **禁止** 评论不带 🤖 标识
3. **禁止** Agent 修改其他 Agent 的任务（只能处理自己标签的任务）
4. **禁止** 在未告知 Chris 的情况下，批量修改任务
5. **禁止** 共享 API Key（每个 Agent 独立 Key）

---

## 🔧 技术实现

### Linear API

- **Endpoint**: `https://api.linear.app/graphql`
- **认证**: `Authorization: {API_KEY}` (无 Bearer 前缀)
- **IFM Team ID**: `e890eec9-ac9b-4617-a1f1-2c240a7a928f`

### Agent 配置示例

```json
{
  "agent_name": "Bob",
  "agent_label": "Dev-Bob",
  "api_key_env": "LINEAR_BOB_KEY"
}
```

### Skill 使用（Hermes 环境）

```python
# 加载 Skill
skill_view(name='linear-agent')

# 读取我的任务
from linear_agent import read_my_tasks
tasks = read_my_tasks()

# 更新任务
from linear_agent import update_task
update_task(
    issue_id="IFM-18",
    action="completed",
    message="功能已实现",
    pr_url="https://..."
)
```

---

## 📊 可视化工具

本项目的可视化工具（`index.html`）展示了整个 OPC + Agent 协作机制：

- **系统架构图**: 展示角色之间的关系
- **标签树**: 交互式展示三层标签体系
- **任务流程**: 状态流转和规则说明
- **Agent 目录**: 所有 Agent 的信息和职责

**数据驱动**: 所有内容来自 `data/config.json`，修改后刷新页面即更新。

---

## 📖 使用指南

### 添加新 Agent

编辑 `data/config.json`:

```json
{
  "agents": [
    {
      "name": "Alice",
      "role": "Dev Agent",
      "label": "Dev-Alice",
      "duties": ["Develop features", "Fix bugs"],
      "config_example": {
        "agent_name": "Alice",
        "agent_label": "Dev-Alice",
        "api_key_env": "LINEAR_ALICE_KEY"
      }
    }
  ]
}
```

刷新页面 → 新 Agent 卡片出现 ✅

### 添加新标签

编辑 `data/config.json`:

```json
{
  "labels": {
    "👤 员工标签": [
      {"name": "Dev-Alice", "color": "#2ecc71", "desc": "Alice 的开发任务"}
    ]
  }
}
```

刷新页面 → 标签树更新 ✅

---

## 🔍 审计机制

**频率**: 每天 09:00（由嘉怡执行）

**检查内容**:
1. 所有带 🤖 标识的评论是否格式规范
2. Agent 是否违规将状态改到 Done
3. `Needs-Human-Review` 标签是否及时处理
4. 阻塞任务（`Agent-Blocked`）是否需要人工介入

**违规处理**:
- 添加警告评论到 Issue
- 通知 Chris（通过 Telegram）
- 记录到审计日志

---

## 📂 项目结构

```
opc-agent-mechanism/
├── index.html          # 可视化主页面
├── LICENSE            # CC BY-NC 4.0 许可证
├── README.md          # 项目说明
├── SPEC.md            # 本文件（项目方案说明）
├── data/
│   └── config.json    # 数据驱动核心（标签、Agent、工作流）
├── css/
│   └── style.css      # 浅色主题
└── js/
    ├── render-labels.js   # 标签树渲染
    └── render-agents.js   # Agent 卡片渲染
```

---

## 🌐 在线演示

**GitHub Pages**: https://bluemanta.github.io/opc-agent-mechanism/

---

## 📞 联系

- **GitHub**: [@bluemanta](https://github.com/bluemanta)
- **Email**: wccshow@gmail.com
- **项目**: https://github.com/bluemanta/opc-agent-mechanism

---

## 📝 版本历史

- **v0.1** (2026-05-03): MVP 版本，基础可视化 + 核心协作规范
- **未来计划**: v0.2 增加交互功能，v1.0 完整生产环境验证

---

**Made with ❤️ for the OPC + AI Agent community (非商用 🚫)**
