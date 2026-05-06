# OPC Agent Mechanism v0.2 - Linear Issue Direct-Read MVP

## Positioning

This MVP is a local operating workflow for an OPC user coordinating multiple desktop Agent tools through Linear.

The system is intentionally lightweight:

- Linear is the only task ledger.
- Linear Issue is the task body.
- Desktop Agents read Linear Issues directly.
- Desktop Agents execute inside their own project session.
- Desktop Agents write status and evidence directly back to Linear.
- Hermes governs Issue quality, priority, review, and tracking.

Hermes does not generate mandatory execution packets and does not act as a result relay.

## Roles

| Role | Responsibility |
| --- | --- |
| Chris | Sets goals, confirms priority, makes final decisions, verifies outcomes |
| Hermes | Creates and clarifies Issues, checks Todo quality, tracks `Blocked` work and In Review, assists review |
| Desktop Agents | Read Issues, execute in project session, write evidence back to Linear |
| Linear | Stores tasks, states, comments, evidence, risks, and review conclusions |

## Linear States

Use the existing Linear standard statuses. Do not create custom `Ready`, `Verified`, or `Blocked` statuses.

```text
Backlog -> Todo -> In Progress -> In Review -> Done
```

Standard terminal states:

```text
Canceled
Duplicate
```

Rules:

- Desktop Agents may move Issues to `In Progress` or `In Review`.
- Desktop Agents must not move Issues to `Done`.
- `Done` means Chris or Hermes has reviewed the evidence.
- Former `Ready` language maps to Linear `Todo`; former `Verified` language maps to Linear `Done`.
- Blocked work is represented with the single `Blocked` task-type label plus comments, not a custom status or reason-specific blocked labels.
- Unclear Issues should be improved in Linear, not wrapped by a separate Hermes execution package.

## Linear Labels

Infomili uses three label groups. Every actionable Issue should have one role label, one employee label, and one task-type label whenever possible.

Role labels describe the capability required:

```text
AI-Dev
AI-Test
AI-Design
AI-Review
AI-Docs
AI-Ops
```

Employee labels identify the concrete Agent:

```text
Agent-Codex
Agent-Cursor
Agent-ClaudeCode
Agent-AntiGravity
Agent-Bob
Agent-Oao
```

Task-type labels are intentionally small:

```text
Feature
Bug
Improvement
Blocked
```

`Blocked` covers every kind of blocked work: unclear task, missing context, missing permission, pending decision, waiting dependency, or human review. The reason belongs in the Issue comment, not in a separate label.

## Issue Template

```markdown
## Task
要完成什么。

## Background
本任务必要背景。项目通用背景不用重复，除非本任务特别相关。

## Scope
本次要做什么 / 不做什么。

## Acceptance
什么算完成。

## Return Evidence
完成后直接回填：变更摘要、文件/链接、验证结果、风险。
```

Todo requires non-placeholder `Task`, `Scope`, `Acceptance`, and `Return Evidence`.

## Agent Result Format

```markdown
## Result
完成了什么。

## Changed
涉及的文件、PR、链接或产物。

## Verification
运行了什么检查，结果如何。

## Risks
剩余风险、未覆盖部分、需要人工判断的点。

## Next
建议下一步；没有则写“无”。
```

## Operational SOP

1. Chris or Hermes creates a Linear Issue.
2. Hermes helps clarify the Issue until it is Todo-ready.
3. Desktop Agent reads the Issue directly from Linear inside the relevant project session.
4. Desktop Agent executes and writes evidence to the Issue.
5. Desktop Agent moves the Issue to In Review.
6. Chris or Hermes reviews the evidence in Linear.
7. If accepted, the Issue moves to Done. If not, it returns to In Progress or Todo with comments.

## Pilot

Run the MVP on one real project for one week:

- Create 5-10 real Linear Issues.
- Cover code, research, review, and docs tasks.
- Let each desktop Agent process at least one Issue.
- Review whether Issue clarity, evidence, state transitions, and the three-part label routing are sufficient.

See [Pilot Issue examples](examples/pilot-linear-issues.md).

## Tooling

Use the local validator to check copied Issue or comment Markdown:

```bash
python3 tools/validate-linear-mvp.py issue path/to/issue.md
python3 tools/validate-linear-mvp.py result path/to/comment.md
```
