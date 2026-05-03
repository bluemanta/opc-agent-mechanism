# OPC Agent Mechanism Visualizer

> 🤖 A data-driven visualization of the OPC (One Person Company) + AI Agent collaborative workflow system.

**Version**: v0.1 (MVP)  
**License**: [CC BY-NC 4.0](#license) (Non-Commercial Use Only)

---

## 🌐 Live Demo

**GitHub Pages**: https://bluemanta.github.io/opc-agent-mechanism/

> Double-click `index.html` to run locally, or visit the GitHub Pages link above.

---

## 🎯 What is this?

This is a **visualization tool** that demonstrates how an OPC (One Person Company) can collaborate with multiple AI Agents through Linear as a central hub.

**Core Purpose**:
- 📖 Lower cognitive load: Understand the whole system in 5 minutes
- 🔄 Data-driven: Update `config.json` → page auto-updates
- 🎨 Lightweight: Pure HTML/CSS/JS, no frameworks, no build tools
- 📂 Open-source: Share the OPC+Agent methodology with the community

**Note**: This is NOT a software project or a management dashboard. It is a **methodology presentation tool**.

---

## 📋 Features

### 1. System Architecture Diagram
Visualizes the OPC+Agent collaboration chain:
```
[Chris OPC] → [Jiayi (PM Agent)] → [Bob/Alice (Dev Agents)] ↔ [Linear Central]
```

### 2. Label Hierarchy Tree
Interactive 3-layer label system:
- 🎭 Role Labels (AI-Dev, AI-Test, ...)
- 👤 Employee Labels (Dev-Bob, Dev-Oao, ...)
- 📋 Task Types (Bug, Feature, ...)

*Click to expand/collapse layers.*

### 3. Task Flow & Rules
Shows state transitions and agent permissions:
```
Todo → In Progress → In Review → Done
```
- ❌ Agents CANNOT change to "Done"
- ✅ Agents CAN change to "In Review"
- ⚠️ Requires human review

### 4. Agent Directory
Cards showing all agents in the system:
- Agent name, role, label
- Responsibilities
- Configuration example (config.json)

---

## 🚀 Quick Start

### Option 1: Online (GitHub Pages)
Visit: https://bluemanta.github.io/opc-agent-mechanism/

### Option 2: Local
```bash
# Clone the repo
git clone https://github.com/bluemanta/opc-agent-mechanism.git
cd opc-agent-mechanism

# Open in browser (double-click)
open index.html  # macOS
# or just double-click index.html in Finder
```

---

## 🔧 Data-Driven Updates

All content is loaded from `data/config.json`. To update the visualization:

### Adding a new agent:
```json
// data/config.json
{
  "agents": [
    {
      "name": "Alice",
      "role": "Dev Agent",
      "label": "Dev-Alice",
      "duties": ["Develop features", "Fix bugs"]
    }
    // ... existing agents
  ]
}
```
**Result**: Refresh the page → new agent card appears ✅

### Adding a new label:
```json
{
  "labels": {
    "👤 员工标签": [
      {"name": "Dev-Alice", "color": "#2ecc71", "desc": "Alice's dev tasks"}
      // ... existing labels
    ]
  }
}
```
**Result**: Refresh the page → label tree updates ✅

---

## 📂 Project Structure

```
opc-agent-mechanism/
├── index.html          # Main visualization page
├── LICENSE            # CC BY-NC 4.0
├── README.md          # This file
├── data/
│   └── config.json    # All data (labels, agents, workflow)
├── css/
│   └── style.css      # Light theme
└── js/
    ├── render-labels.js   # Label tree renderer
    └── render-agents.js  # Agent card renderer
```

---

## 📖 How It Works

### The OPC+Agent System (Brief)

1. **Chris (OPC)**: Defines strategy, reviews results
2. **Jiayi (PM Agent)**: Allocates tasks, defines standards, audits compliance
3. **Dev Agents (Bob, Alice...)**: Execute tasks via Linear API
4. **Linear**: Central hub for task management

### Key Rules:
- All tasks assigned to Chris (only human in Linear)
- Agents use **independent API keys**
- Agents **CANNOT** change status to "Done" (requires human review)
- Two-layer label system: Role + Employee

For full details, open `index.html` and explore the visualization.

---

## 📃 License

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**

### ✅ Permitted (Non-Commercial Only):
- Personal learning and study
- Building your own OPC+Agent system
- Modifying `config.json` for your needs
- Sharing with attribution (credit to Chris Wang / Bluemanta)

### ❌ Prohibited (Commercial Use):
- Creating **paid tutorials or courses** based on this material
- Republishing as paid newsletters or datasets
- Bundling into **paid services or commercial products**
- Any commercial use requires **prior written permission** from Chris Wang

### Commercial Licensing:
Contact: wccshow@gmail.com

Full license text: See [LICENSE](LICENSE) file.

---

## 🤔 FAQ

**Q: Is this a software project?**  
A: No. It's a visualization/presentation tool for a methodology.

**Q: Can I use this for my OPC?**  
A: Yes, for personal/non-commercial use. Just give attribution.

**Q: Can I make a course teaching this system?**  
A: ❌ No, that's commercial use. Contact for written permission.

**Q: How do I update the labels/agents?**  
A: Edit `data/config.json`, refresh the page.

---

## 📞 Contact

- **GitHub**: [@bluemanta](https://github.com/bluemanta)
- **Email**: wccshow@gmail.com
- **Project**: https://github.com/bluemanta/opc-agent-mechanism

---

**Made with ❤️ for the OPC + AI Agent community (non-commercial only 🚫)**
