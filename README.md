# bluemanta-opc

> Linear Issue 直读式多桌面 Agent 工作流 MVP。

**Version**: v0.2
**License**: [CC BY-NC 4.0](#license) (Non-Commercial Use Only)

---

## What Is This?

This repository contains two things:

1. A static visualizer for explaining the workflow.
2. A practical workflow kit for running the MVP with Linear, Hermes, and desktop Agent tools.

`bluemanta-opc` was formerly named OPC Agent Mechanism. The new name keeps the OPC concept while making the project identity explicitly tied to Bluemanta.

The MVP does not build a new task platform. Linear is the single source of truth, and each Linear Issue is the task body. Desktop Agents such as Codex App, Cursor, Claude Code Desktop, and AntiGravity read the Issue directly in their project session, execute the task, and write status/evidence back to the same Issue.

Hermes is not an execution-package middle layer. Hermes helps Chris create, clarify, prioritize, review, and track Linear Issues.

---

## Core Workflow

```text
Chris / Hermes -> clear Linear Issue
Desktop Agent -> read Linear Issue in project session
Desktop Agent -> execute with repo/session context
Desktop Agent -> write Result / Changed / Verification / Risks / Next back to Linear
Chris / Hermes -> review in Linear -> Done
```

Key rules:

- Linear Issue is the task body.
- Statuses follow the existing Linear standard: `Backlog -> Todo -> In Progress -> In Review -> Done`, with `Canceled` and `Duplicate` as terminal states.
- Each actionable Issue should carry three labels: one role label, one employee Agent label, and one task-type label.
- Blocked work uses the single `Blocked` task-type label; the reason is written in the Issue comment.
- Desktop Agents read Issues directly.
- Desktop Agents write results directly to Linear.
- Hermes governs Issue quality and review, but does not generate mandatory execution packets.
- `Todo` is the executable state, equivalent to the earlier `Ready` wording.
- `Done` is reserved for Chris or Hermes after review, equivalent to the earlier `Verified` wording.

---

## Workflow Assets

- [MVP SOP](docs/workflow/linear-issue-direct-mvp.md)
- [Linear Issue template](templates/linear-issue-template.md)
- [Agent result comment template](templates/agent-result-comment-template.md)
- [Linear Project profile template](templates/linear-project-profile-template.md)
- [Hermes daily check template](templates/hermes-daily-check-template.md)
- [Pilot Issue examples](examples/pilot-linear-issues.md)

Local validation:

```bash
python3 tools/validate-linear-mvp.py issue templates/linear-issue-template.md
python3 tools/validate-linear-mvp.py result templates/agent-result-comment-template.md
```

The template files intentionally contain placeholders, so they should fail validation until filled with real task content.

---

## Static Visualizer

The webpage now includes the architecture view, setup order, pilot checklist, and copyable Markdown templates for Linear Project profiles, Issues, Agent result comments, and Hermes daily checks.

Open locally:

```bash
open index.html
```

Or serve locally:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://127.0.0.1:8000
```

GitHub Pages:

```text
https://bluemanta.github.io/bluemanta-opc/
```

---

## Project Structure

```text
bluemanta-opc/
├── index.html
├── data/config.json
├── css/style.css
├── js/app.js
├── docs/workflow/
│   └── linear-issue-direct-mvp.md
├── templates/
│   ├── linear-issue-template.md
│   ├── agent-result-comment-template.md
│   ├── linear-project-profile-template.md
│   └── hermes-daily-check-template.md
├── examples/
│   └── pilot-linear-issues.md
└── tools/
    ├── validate-linear-mvp.py
    └── audit-linear-agents.py
```

---

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

Permitted for personal learning and non-commercial use with attribution. Commercial use requires prior written permission from Chris Wang.
