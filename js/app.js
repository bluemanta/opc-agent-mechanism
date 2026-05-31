const APP_VERSION = '20260529-1';
const text = (value) => String(value ?? '');
let activeCopyBlocks = [];
let copyButtonsBound = false;

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderList(items = [], className = '') {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function normalizeConfig(data) {
  const defaultDiagram = {
    nodes: [
      { id: 'chris', label: 'Chris OPC' },
      { id: 'linear', label: 'Linear Issue 账本' },
      { id: 'hermes', label: 'Hermes 治理' },
      { id: 'agents', label: '桌面 Agent' }
    ],
    links: [
      { from: 'chris', to: 'hermes', label: '目标 / 优先级' },
      { from: 'linear', to: 'hermes', label: '读取 Todo Issue' },
      { from: 'linear', to: 'agents', label: '直接读取 Issue' }
    ],
    feedback: { from: 'agents', to: 'linear', label: '直接写入 Issue：状态 / 证据 / 风险' },
    review: { from: 'linear', to: 'chris', label: 'Chris + Hermes 在 Linear 审核' }
  };

  const defaultWorkflow = {
    states: [
      { name: 'Backlog', desc: '想做但尚未整理成可执行任务', actor: 'Chris / Hermes' },
      { name: 'Todo', desc: 'Issue 已具备目标、范围和验收标准，桌面 Agent 可直接读取执行', actor: 'Chris / Hermes' },
      { name: 'In Progress', desc: '某个桌面 Agent 正在执行', actor: 'Desktop Agent' },
      { name: 'In Review', desc: 'Agent 已交付证据，等待 Hermes 或 Chris 复核', actor: 'Hermes / Chris' },
      { name: 'Done', desc: '结果已确认，可关闭或沉淀', actor: 'Chris / Hermes' }
    ],
    exceptions: [
      { name: 'Canceled', desc: '任务不再需要执行' },
      { name: 'Duplicate', desc: '任务与其他 Issue 重复' }
    ],
    rules: [
      'Agent 完成任务后进入 In Review，不直接进入 Done',
      '桌面 Agent 直接读取 Linear Issue，不经过 Hermes 中转',
      'Issue 应写清本次任务目标、范围、验收标准和回填要求',
      '缺少验收标准的 Issue 不进入 Todo',
      '阻塞统一通过评论和 Blocked 标签表达，不新增 Blocked 状态',
      'Hermes 负责 Issue 治理与审核追踪，不生成必经执行包'
    ]
  };

  const defaultLabels = {
    '🎭 角色标签': [
      { name: 'AI-Design', color: '#9b59b6', desc: '设计、交互、视觉与体验' },
      { name: 'AI-Dev', color: '#3498db', desc: '开发、工程实现、代码修改' },
      { name: 'AI-Docs', color: '#1abc9c', desc: '文档、说明、规范、内容沉淀' },
      { name: 'AI-Ops', color: '#e74c3c', desc: '运维、发布、配置、自动化运行' },
      { name: 'AI-Review', color: '#e67e22', desc: '审核、复核、验收辅助' },
      { name: 'AI-Test', color: '#2ecc71', desc: '测试、验证、质量检查' }
    ],
    '👤 员工标签': [
      { name: 'Agent-AntiGravity', color: '#F2994A', desc: 'AntiGravity 桌面 Agent' },
      { name: 'Agent-Bob', color: '#3498db', desc: 'Bob Agent' },
      { name: 'Agent-ClaudeCode', color: '#8E6CEF', desc: 'Claude Code Agent' },
      { name: 'Agent-Codex', color: '#5E6AD2', desc: 'Codex 桌面 Agent' },
      { name: 'Agent-Cursor', color: '#26B5CE', desc: 'Cursor Agent' },
      { name: 'Agent-Oao', color: '#2ecc71', desc: 'Oao Agent' }
    ],
    '📋 任务类型': [
      { name: 'Blocked', color: '#95a5a6', desc: '任何无法继续推进的任务；原因写在评论' },
      { name: 'Bug', color: '#EB5757', desc: '缺陷修复、异常处理、回归问题' },
      { name: 'Feature', color: '#BB87FC', desc: '新功能、新能力、新页面或新流程' },
      { name: 'Improvement', color: '#4EA7FC', desc: '优化、调整、重构、质量提升' }
    ]
  };

  const architectureNodes = data.architecture?.nodes?.length
    ? data.architecture.nodes
    : [
        { id: 'human', label: 'Chris / OPC', desc: '提出目标、做关键决策、最终确认' },
        { id: 'hermes', label: 'Hermes', desc: 'Telegram 任务治理助手：协助创建、梳理、审核和追踪 Linear Issue' },
        { id: 'linear', label: 'Linear', desc: '唯一任务账本与任务本体：Issue、状态、评论、证据、审核结果' },
        { id: 'project', label: 'Project Session Context', desc: '桌面 Agent 在 IDE / 本地项目 session 中已经持有的项目上下文' },
        { id: 'executors', label: 'Desktop Agents', desc: 'Cursor、Codex App、Claude Code Desktop、AntiGravity 半自动执行' }
      ];

  const architectureFlow = data.architecture?.flow || [
    'Chris 与 Hermes 在 Telegram 中确定优先级',
    'Hermes 协助把想法整理成清晰的 Linear Issue',
    '桌面 Agent 直接读取 Linear Issue，并结合自身项目 session 上下文执行',
    'Agent 完成后直接回填 Linear Issue 的状态、证据和风险',
    'Chris 和 Hermes 在 Linear 中审核结果，推动 In Review 与 Done'
  ];

  const defaultExecutors = [
    {
      name: 'Codex App',
      role: '本地工程执行与验证',
      best_for: ['跨文件代码修改', '本地测试与构建验证', '结构化重构'],
      handoff: '直接读取 Linear Issue，完成后直接回填 Issue；复杂设计问题可在 Issue 中标记需要澄清。',
      limits: ['不直接 Done', '不处理缺少验收标准的任务']
    },
    {
      name: 'Claude Code Desktop',
      role: '长上下文分析与工程协作',
      best_for: ['理解大型代码库', '方案比较', '复杂重构前分析'],
      handoff: '需要落地验证时转 Codex App 或 Cursor。',
      limits: ['输出必须包含文件和验证建议', '不把分析结论当作已验证结果']
    },
    {
      name: 'Cursor',
      role: '交互式编码与快速修改',
      best_for: ['局部功能改动', '快速试错', 'UI 细节调整'],
      handoff: '直接读取 Linear Issue，完成后直接回填 Linear；必要时由 Codex App 复验。',
      limits: ['避免承担跨项目批处理', '需要明确当前项目上下文']
    },
    {
      name: 'AntiGravity',
      role: '探索型 Agent 工作台',
      best_for: ['多步骤探索', '原型推演', '不确定任务拆解'],
      handoff: '将探索结果整理成 Linear Issue 或项目上下文更新建议。',
      limits: ['探索输出必须收敛成可执行下一步', '不直接改 Done 状态']
    }
  ];

  const defaultRoutine = [
    { time: '09:00', title: 'Hermes 巡检 Linear', desc: '按项目查看 Todo / Blocked / In Review Issue，生成 Telegram 摘要' },
    { time: '09:15', title: '补齐 Issue', desc: 'Chris 和 Hermes 把目标、范围、验收和回填要求补充清楚' },
    { time: '执行中', title: '桌面 Agent 直读 Issue', desc: 'Agent 在对应项目 session 中读取 Linear Issue，结合已有项目上下文执行' },
    { time: '完成后', title: 'Linear 中审核', desc: 'Chris 和 Hermes 在 Linear 中审核结果，推动 In Review 或 Done' }
  ];

  const defaultRoadmap = [
    { version: 'v0.2', title: '半自动调度', items: ['Hermes 巡检 Linear', '补齐 Issue 质量', '桌面 Agent 直接读 Issue'] },
    { version: 'v0.3', title: 'Issue 质量治理', items: ['标准 Issue 模板', '验收标准检查', '回填证据检查'] },
    { version: 'v0.4', title: '低风险自动执行', items: ['对支持 CLI 的工具自动处理低风险任务', '自动跑检查', '统一进入 In Review'] },
    { version: 'v1.0', title: '无人值守编排', items: ['任务自动领取', '执行隔离与权限控制', '审计、重试、转派机制'] }
  ];

  const defaultWorkflowImplementation = {
    setup_sequence: [
      { phase: 'Step 1', title: '配置 Linear 工作区', desc: '确认沿用 Linear 现有状态流转，再补齐权限边界和标签体系。' },
      { phase: 'Step 2', title: '建立项目档案', desc: '记录本地 repo/session、默认桌面 Agent、验证方式和当前阶段。' },
      { phase: 'Step 3', title: '创建 5-10 个试点 Issue', desc: '按标准模板补齐 Task、Scope、Acceptance、Return Evidence，并选择角色、员工和任务类型标签。' },
      { phase: 'Step 4', title: '桌面 Agent 直读 Issue', desc: '在对应项目 session 中读取 Issue，并推进到 In Progress。' },
      { phase: 'Step 5', title: '执行结果回写 Linear', desc: '在 Issue 评论中写 Result、Changed、Verification、Risks、Next，并进入 In Review。' },
      { phase: 'Step 6', title: 'Chris / Hermes 审核', desc: '通过则 Done；不通过则说明原因并退回。' },
      { phase: 'Step 7', title: '一周复盘并固化规则', desc: '复盘 Issue 质量、证据格式、状态流转和三类标签分流。' }
    ],
    copy_blocks: [
      {
        title: 'Linear Issue 标准模板',
        desc: '创建或补齐 Todo Issue 时直接复制。',
        content: '## Labels\n- Role: AI-Dev / AI-Test / AI-Design / AI-Review / AI-Docs / AI-Ops\n- Agent: Agent-Codex / Agent-Cursor / Agent-ClaudeCode / Agent-AntiGravity / Agent-Bob / Agent-Oao\n- Type: Feature / Bug / Improvement / Blocked\n\n## Task\n要完成什么。\n\n## Background\n本任务必要背景。项目通用背景不用重复，除非本任务特别相关。\n\n## Scope\n本次要做什么 / 不做什么。\n\n## Acceptance\n什么算完成。\n\n## Return Evidence\n完成后直接回填：变更摘要、文件/链接、验证结果、风险。'
      },
      {
        title: 'Agent 回填评论模板',
        desc: '桌面 Agent 完成任务后直接贴到 Linear Issue 评论。',
        content: '## Result\n完成了什么。\n\n## Changed\n涉及的文件、PR、链接或产物。\n\n## Verification\n运行了什么检查，结果如何。\n\n## Risks\n剩余风险、未覆盖部分、需要人工判断的点。\n\n## Next\n建议下一步；没有则写“无”。'
      },
      {
        title: 'Linear Project 档案模板',
        desc: '放在 Linear Project 描述或项目 Wiki，用于承载长期项目背景。',
        content: '## Project Session\n- 本地 repo / workspace:\n- 默认桌面 Agent:\n- 常用验证方式:\n- 当前阶段:\n- 重要限制:\n\n## Agent Session Notes\n- 该项目通常在哪个桌面 Agent 中处理:\n- Agent session 需要提前打开的目录或工具:\n- 常见上下文来源:\n\n## Label Rules\n- 角色标签: AI-Dev / AI-Test / AI-Design / AI-Review / AI-Docs / AI-Ops\n- 员工标签: Agent-Codex / Agent-Cursor / Agent-ClaudeCode / Agent-AntiGravity / Agent-Bob / Agent-Oao\n- 任务类型: Feature / Bug / Improvement / Blocked\n- 每个可执行 Issue 应尽量同时具备 1 个角色标签、1 个员工标签、1 个任务类型标签\n- 所有阻塞、待澄清、待权限、待决策、待人工 review 的任务统一使用 Blocked；具体原因写在 Issue 评论中\n\n## Review Rules\n- 谁可以 Done:\n- 哪些任务必须 Chris 审核:\n- 哪些任务可以 Hermes 初审:'
      },
      {
        title: 'Hermes 每日巡检模板',
        desc: '每日早间巡检 Linear 时，用于给 Chris 汇总建议。',
        content: '## Todo\n- Issue:\n- 标签完整性（角色 / 员工 / 任务类型）:\n- 推荐动作:\n\n## Blocked\n- Issue:\n- 阻塞原因:\n- 需要 Chris 决策:\n\n## In Review\n- Issue:\n- 初审意见:\n- 建议通过 / 退回:\n\n## Stale\n- Issue:\n- 最后更新时间:\n- 建议动作:\n\n## Today\n1.\n2.\n3.'
      }
    ],
    pilot_checklist: [
      '只选择 1 个真实项目试跑，不要一次铺开所有项目',
      '先准备 5-10 个真实 Issue，并为每个 Issue 选择角色、员工和任务类型标签',
      '每个桌面 Agent 至少执行 1 个 Issue，观察是否能只靠项目 session + Issue 完成任务',
      '所有完成结果都必须进入 In Review，并附带证据',
      '试跑 1 周后复盘 Issue 质量、状态流转、证据格式和 Agent 分工'
    ]
  };

  if (data.positioning) {
    return {
      ...data,
      labels: data.labels || defaultLabels,
      architecture: {
        ...data.architecture,
        diagram: data.architecture?.diagram || defaultDiagram,
        nodes: architectureNodes,
        flow: architectureFlow
      },
      workflow: {
        ...defaultWorkflow,
        ...data.workflow,
        states: data.workflow?.states || defaultWorkflow.states,
        exceptions: data.workflow?.exceptions || defaultWorkflow.exceptions,
        rules: data.workflow?.rules || defaultWorkflow.rules
      },
      workflow_implementation: {
        ...defaultWorkflowImplementation,
        ...data.workflow_implementation,
        setup_sequence: data.workflow_implementation?.setup_sequence || defaultWorkflowImplementation.setup_sequence,
        copy_blocks: data.workflow_implementation?.copy_blocks || defaultWorkflowImplementation.copy_blocks,
        pilot_checklist: data.workflow_implementation?.pilot_checklist || defaultWorkflowImplementation.pilot_checklist
      }
    };
  }

  return {
    ...data,
    positioning: {
      title: 'Bluemanta OPC',
      subtitle: 'Linear Issue 直读式多桌面 Agent 工作流 MVP',
      principles: [
        'Linear Issue 是任务本体，也是唯一任务账本',
        'Hermes 负责协助创建、梳理、优先级排序、审核和追踪 Issue',
        '桌面 Agent 直接读取 Linear Issue，并结合自身项目 session 上下文执行',
        '桌面 Agent 的执行结果直接回填到 Linear Issue',
        '如果任务不够清楚，优先把 Linear Issue 写得更完整',
        'Agent 完成不等于闭环，Done 才代表任务真正结束'
      ]
    },
    architecture: {
      ...(data.architecture || {}),
      diagram: defaultDiagram,
      nodes: architectureNodes,
      flow: architectureFlow
    },
    context_layers: data.context_layers || [
      {
        name: '项目 Session 上下文',
        owner: 'Desktop Agent Session',
        purpose: '桌面 Agent 在 IDE / 本地项目中持有项目背景，Issue 不需要重复全部项目说明',
        contents: ['项目目标、当前阶段、关键决策', '本地 repo 路径、运行方式、常用命令']
      },
      {
        name: 'Issue 任务差量层',
        owner: 'Hermes / Chris',
        purpose: '只描述这一次要做什么，以及额外上下文',
        contents: ['Task：本次目标', 'Acceptance：验收标准', 'Return Evidence：回填要求']
      },
      {
        name: '执行回填层',
        owner: 'Desktop Agent',
        purpose: '执行结果直接写入 Linear Issue，支撑 In Review 和 Done',
        contents: ['变更摘要、文件或产物链接', '验证命令与结果', '风险、阻塞点、下一步建议']
      }
    ],
    labels: data.labels || defaultLabels,
    issue_template: data.issue_template || {
      sections: [
        { title: 'Labels', body: 'Role: AI-Dev / AI-Test / AI-Design / AI-Review / AI-Docs / AI-Ops\nAgent: Agent-Codex / Agent-Cursor / Agent-ClaudeCode / Agent-AntiGravity / Agent-Bob / Agent-Oao\nType: Feature / Bug / Improvement / Blocked' },
        { title: 'Task', body: '本次要完成什么。' },
        { title: 'Background', body: '本任务必要背景。项目通用背景不用重复，除非本任务特别相关。' },
        { title: 'Scope', body: '本次要做什么 / 不做什么。' },
        { title: 'Acceptance', body: '什么算完成。' },
        { title: 'Return Evidence', body: '完成后直接在 Linear Issue 回填：变更摘要、文件/链接、验证结果、风险、下一步建议。' }
      ],
      executor_override: '通常用员工标签指定具体 Agent；仅当标签不足以表达时填写补充原因'
    },
    workflow: {
      ...defaultWorkflow,
      ...(data.workflow || {}),
      states: data.workflow?.states || defaultWorkflow.states,
      exceptions: data.workflow?.exceptions || defaultWorkflow.exceptions,
      rules: data.workflow?.rules || defaultWorkflow.rules
    },
    workflow_implementation: {
      ...defaultWorkflowImplementation,
      ...(data.workflow_implementation || {}),
      setup_sequence: data.workflow_implementation?.setup_sequence || defaultWorkflowImplementation.setup_sequence,
      copy_blocks: data.workflow_implementation?.copy_blocks || defaultWorkflowImplementation.copy_blocks,
      pilot_checklist: data.workflow_implementation?.pilot_checklist || defaultWorkflowImplementation.pilot_checklist
    },
    executors: data.executors || ((data.agents || []).length ? data.agents.map((agent) => ({
      name: agent.name,
      role: agent.role,
      best_for: agent.duties || [],
      handoff: '执行结果直接回填 Linear Issue。',
      limits: ['不直接 Done', '需要明确项目上下文']
    })) : defaultExecutors),
    daily_routine: data.daily_routine || defaultRoutine,
    roadmap: data.roadmap || defaultRoadmap
  };
}

function renderPositioning(data) {
  document.getElementById('positioning-title').textContent = data.title;
  document.getElementById('positioning-subtitle').textContent = data.subtitle;
  document.getElementById('principle-list').innerHTML = data.principles
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
}

function renderLogicDiagram(diagram) {
  const container = document.getElementById('logic-diagram');
  if (!container || !diagram) return;

  const nodes = diagram.nodes || [];
  const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const labelByTarget = Object.fromEntries((diagram.links || []).map((link) => [link.to, link.label]));
  const node = (id, fallback) => nodeById[id]?.label || fallback;

  container.innerHTML = `
    <div class="hub-diagram">
      <svg class="hub-svg" viewBox="0 0 1180 660" role="img" aria-label="Linear 中心化多 Agent 工作流">
        <defs>
          <linearGradient id="linearHubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#eaf3ff"></stop>
            <stop offset="100%" stop-color="#f2fbf5"></stop>
          </linearGradient>
          <filter id="hubShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#1f2922" flood-opacity="0.12"></feDropShadow>
          </filter>
          <marker id="flowArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#33403a"></path>
          </marker>
        </defs>

        <path class="hub-flow" d="M 220 156 C 322 116, 408 158, 488 230" marker-end="url(#flowArrow)"></path>
        <path class="hub-flow review-flow" d="M 484 260 C 374 230, 285 204, 220 176" marker-end="url(#flowArrow)"></path>
        <path class="hub-flow" d="M 480 385 C 410 420, 350 438, 284 445" marker-end="url(#flowArrow)"></path>
        <path class="hub-flow" d="M 695 245 C 775 170, 858 130, 950 138" marker-end="url(#flowArrow)"></path>
        <path class="hub-flow" d="M 705 312 C 792 292, 876 292, 954 304" marker-end="url(#flowArrow)"></path>
        <path class="hub-flow" d="M 695 385 C 770 448, 850 490, 944 485" marker-end="url(#flowArrow)"></path>
        <path class="hub-flow accent-flow" d="M 940 528 C 840 600, 680 594, 620 472" marker-end="url(#flowArrow)"></path>

        <g class="hub-node node-chris" transform="translate(54 82)">
          <rect width="210" height="108" rx="16"></rect>
          <text class="node-kicker" x="22" y="28">Human</text>
          <text class="node-title" x="22" y="58">${escapeHtml(node('chris', 'Chris OPC'))}</text>
          <text class="node-caption" x="22" y="82">目标 / 优先级</text>
          <text class="node-caption" x="22" y="101">最终确认</text>
        </g>

        <g class="hub-node node-hermes" transform="translate(80 385)">
          <rect width="250" height="140" rx="18"></rect>
          <text class="node-kicker" x="24" y="31">Orchestrator</text>
          <text class="node-title" x="24" y="64">${escapeHtml(node('hermes', 'Hermes 治理'))}</text>
          <text class="node-caption" x="24" y="94">创建 / 梳理 Issue</text>
          <text class="node-caption" x="24" y="116">优先级 / 审核 / 追踪</text>
        </g>

        <g class="linear-hub" transform="translate(465 210)">
          <circle cx="120" cy="120" r="122"></circle>
          <circle class="hub-ring" cx="120" cy="120" r="150"></circle>
          <text class="hub-kicker" x="120" y="82" text-anchor="middle">Single Source of Truth</text>
          <text class="hub-title" x="120" y="126" text-anchor="middle">Linear</text>
          <text class="hub-subtitle" x="120" y="157" text-anchor="middle">唯一任务账本</text>
          <text class="hub-caption" x="120" y="194" text-anchor="middle">Issue / 状态 / 评论 / 证据 / 审核</text>
        </g>

        <g class="hub-node node-agent-1" transform="translate(905 90)">
          <rect width="230" height="92" rx="16"></rect>
          <text class="node-kicker" x="22" y="29">Desktop Agent 1</text>
          <text class="node-title" x="22" y="60">Codex App</text>
          <text class="node-caption" x="22" y="81">本地工程执行与验证</text>
        </g>

        <g class="hub-node node-agent-2" transform="translate(930 258)">
          <rect width="220" height="92" rx="16"></rect>
          <text class="node-kicker" x="22" y="29">Desktop Agent 2</text>
          <text class="node-title" x="22" y="60">Cursor</text>
          <text class="node-caption" x="22" y="81">交互式编码与快速修改</text>
        </g>

        <g class="hub-node node-agent-3" transform="translate(900 440)">
          <rect width="260" height="104" rx="16"></rect>
          <text class="node-kicker" x="22" y="29">Desktop Agents ...</text>
          <text class="node-title" x="22" y="60">Claude Code / AntiGravity</text>
          <text class="node-caption" x="22" y="83">长上下文分析 / 探索型任务</text>
        </g>

        <g class="asset-pill context-pill" transform="translate(285 400)">
          <rect width="164" height="38" rx="19"></rect>
          <text x="82" y="25" text-anchor="middle">Issue 质量治理</text>
        </g>
        <g class="asset-pill context-pill" transform="translate(746 174)">
          <rect width="164" height="38" rx="19"></rect>
          <text x="82" y="25" text-anchor="middle">项目 session 上下文</text>
        </g>

        <g class="flow-label" transform="translate(285 126)">
          <rect width="136" height="30" rx="15"></rect>
          <text x="68" y="20" text-anchor="middle">${escapeHtml(labelByTarget.hermes || '目标 / 优先级')}</text>
        </g>
        <g class="flow-label review-label" transform="translate(260 210)">
          <rect width="226" height="30" rx="15"></rect>
          <text x="113" y="20" text-anchor="middle">${escapeHtml(diagram.review?.label || 'Chris + Hermes 在 Linear 审核')}</text>
        </g>
        <g class="flow-label" transform="translate(730 98)">
          <rect width="118" height="30" rx="15"></rect>
          <text x="59" y="20" text-anchor="middle">直接读取 Issue</text>
        </g>
        <g class="flow-label" transform="translate(752 270)">
          <rect width="118" height="30" rx="15"></rect>
          <text x="59" y="20" text-anchor="middle">直接读取 Issue</text>
        </g>
        <g class="flow-label" transform="translate(730 398)">
          <rect width="128" height="30" rx="15"></rect>
          <text x="64" y="20" text-anchor="middle">直接读取 Issue</text>
        </g>
        <g class="flow-label feedback-label" transform="translate(675 575)">
          <rect width="286" height="34" rx="17"></rect>
          <text x="143" y="23" text-anchor="middle">${escapeHtml(diagram.feedback?.label || '直接写入 Issue：状态 / 证据 / 风险')}</text>
        </g>
      </svg>

      <div class="hub-summary">
        <div>
          <span>01</span>
          <strong>核心角色只有四类</strong>
          <p>Chris、Hermes、Linear、桌面 Agents；其他都是协作要素。</p>
        </div>
        <div>
          <span>02</span>
          <strong>项目上下文来自 Agent session</strong>
          <p>桌面 Agent 在 IDE / 本地项目中已经持有项目背景。</p>
        </div>
        <div>
          <span>03</span>
          <strong>Linear 是中心账本</strong>
          <p>Chris 与 Hermes 都在 Linear 里完成 In Review 与 Done。</p>
        </div>
      </div>
    </div>
  `;
}

function renderArchitecture(architecture) {
  renderLogicDiagram(architecture.diagram);

  document.getElementById('architecture-nodes').innerHTML = architecture.nodes
    .map((node) => `
      <article class="architecture-card">
        <span>${escapeHtml(node.id)}</span>
        <h3>${escapeHtml(node.label)}</h3>
        <p>${escapeHtml(node.desc)}</p>
      </article>
    `)
    .join('');

  document.getElementById('architecture-flow').innerHTML = architecture.flow
    .map((step, index) => `
      <div class="flow-step">
        <strong>${String(index + 1).padStart(2, '0')}</strong>
        <p>${escapeHtml(step)}</p>
      </div>
    `)
    .join('');
}

function renderContextLayers(layers) {
  document.getElementById('context-layers').innerHTML = layers
    .map((layer) => `
      <article class="layer-card">
        <div class="card-topline">
          <span>${escapeHtml(layer.owner)}</span>
        </div>
        <h3>${escapeHtml(layer.name)}</h3>
        <p>${escapeHtml(layer.purpose)}</p>
        ${renderList(layer.contents)}
      </article>
    `)
    .join('');
}

function renderWorkflow(workflow) {
  document.getElementById('workflow-states').innerHTML = workflow.states
    .map((state, index) => `
      <div class="state-card">
        <span class="state-index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(state.name)}</h3>
        <p>${escapeHtml(state.desc)}</p>
        <strong>${escapeHtml(state.actor)}</strong>
      </div>
    `)
    .join('');

  document.getElementById('workflow-exceptions').innerHTML = workflow.exceptions
    .map((item) => `
      <div class="exception-pill">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.desc)}</span>
      </div>
    `)
    .join('');

  document.getElementById('workflow-rules').innerHTML = workflow.rules
    .map((rule) => `<li>${escapeHtml(rule)}</li>`)
    .join('');
}

function renderLabels(labels) {
  const container = document.getElementById('label-taxonomy');
  if (!container) return;

  container.innerHTML = Object.entries(labels || {})
    .map(([groupName, items]) => `
      <article class="label-card">
        <h3>${escapeHtml(groupName)}</h3>
        <div class="label-list">
          ${items.map((label) => `
            <div class="label-row">
              <span class="label-dot" style="background: ${escapeHtml(label.color)}"></span>
              <div>
                <strong>${escapeHtml(label.name)}</strong>
                <p>${escapeHtml(label.desc || '')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </article>
    `)
    .join('');
}

function renderIssueTemplate(template) {
  document.getElementById('issue-template-card').innerHTML = template.sections
    .map((section) => `
      <div class="template-section">
        <h3>${escapeHtml(section.title)}</h3>
        <p>${escapeHtml(section.body)}</p>
      </div>
    `)
    .join('');

  document.getElementById('executor-override').textContent = template.executor_override;
}

function renderSetupSequence(sequence) {
  const container = document.getElementById('setup-sequence-list');
  if (!container) return;

  container.innerHTML = sequence
    .map((item, index) => `
      <article class="setup-step">
        <div class="setup-marker">${String(index + 1).padStart(2, '0')}</div>
        <div>
          <span>${escapeHtml(item.phase)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.desc)}</p>
        </div>
      </article>
    `)
    .join('');
}

function renderCopyBlocks(blocks) {
  const container = document.getElementById('copy-blocks');
  if (!container) return;

  container.innerHTML = blocks
    .map((block, index) => `
      <article class="copy-card">
        <div class="copy-card-header">
          <div>
            <h3>${escapeHtml(block.title)}</h3>
            <p>${escapeHtml(block.desc)}</p>
          </div>
          <button class="copy-button" type="button" data-copy-index="${index}" aria-label="复制 ${escapeHtml(block.title)}">复制</button>
        </div>
        <pre><code>${escapeHtml(block.content)}</code></pre>
      </article>
    `)
    .join('');
}

function renderPilotChecklist(items) {
  const container = document.getElementById('pilot-checklist');
  if (!container) return;

  container.innerHTML = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
}

function renderExecutors(executors) {
  document.getElementById('executor-grid').innerHTML = executors
    .map((executor) => `
      <article class="executor-card">
        <div class="card-topline">
          <span>${escapeHtml(executor.role)}</span>
        </div>
        <h3>${escapeHtml(executor.name)}</h3>
        <h4>Best for</h4>
        ${renderList(executor.best_for, 'compact-list')}
        <h4>Handoff</h4>
        <p>${escapeHtml(executor.handoff)}</p>
        <h4>Limits</h4>
        ${renderList(executor.limits, 'compact-list')}
      </article>
    `)
    .join('');
}

function renderRoutine(routine) {
  document.getElementById('daily-routine').innerHTML = routine
    .map((item) => `
      <article class="routine-item">
        <time>${escapeHtml(item.time)}</time>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.desc)}</p>
        </div>
      </article>
    `)
    .join('');
}

function renderRoadmap(roadmap) {
  document.getElementById('roadmap').innerHTML = roadmap
    .map((item) => `
      <article class="roadmap-item">
        <span>${escapeHtml(item.version)}</span>
        <h4>${escapeHtml(item.title)}</h4>
        ${renderList(item.items, 'compact-list')}
      </article>
    `)
    .join('');
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function bindCopyButtons(config) {
  activeCopyBlocks = config.workflow_implementation.copy_blocks || [];
  if (copyButtonsBound) return;
  copyButtonsBound = true;

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-index]');
    if (!button) return;

    const index = Number(button.dataset.copyIndex);
    const content = activeCopyBlocks[index]?.content;
    if (!content) return;

    const original = button.textContent;
    try {
      await copyText(content);
      button.textContent = '已复制';
      button.classList.add('is-copied');
    } catch (error) {
      console.warn('复制失败', error);
      button.textContent = '复制失败';
    }

    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-copied');
    }, 1600);
  });
}

function render(data) {
  const config = normalizeConfig(data);

  renderPositioning(config.positioning);
  renderArchitecture(config.architecture);
  renderContextLayers(config.context_layers);
  renderWorkflow(config.workflow);
  renderLabels(config.labels);
  renderIssueTemplate(config.issue_template);
  renderSetupSequence(config.workflow_implementation.setup_sequence);
  renderCopyBlocks(config.workflow_implementation.copy_blocks);
  renderPilotChecklist(config.workflow_implementation.pilot_checklist);
  renderExecutors(config.executors);
  renderRoutine(config.daily_routine);
  renderRoadmap(config.roadmap);
  bindCopyButtons(config);
}

fetch(`data/config.json?v=${APP_VERSION}`, { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) {
      throw new Error('加载 data/config.json 失败');
    }
    return response.json();
  })
  .then(render)
  .catch((error) => {
    console.warn('配置文件加载失败，使用内置默认机制视图。', error);
    render({});
  });
