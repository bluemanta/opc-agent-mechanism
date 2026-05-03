// render-agents.js - Agent 卡片渲染（数据驱动）
function renderAgentCards(agentsData) {
  const container = document.getElementById('agent-cards');
  if (!container) return;

  let html = '';

  agentsData.forEach(agent => {
    const icon = agent.icon || '🤖';
    const label = agent.label 
      ? `<div class="agent-label" style="background: #e8f4fd; color: #3498db;">${agent.label}</div>`
      : '<div class="agent-label" style="background: #f0f0f0; color: #666;">无标签</div>';

    // 职责列表
    let dutiesHtml = '';
    if (agent.duties && agent.duties.length > 0) {
      dutiesHtml = '<ul class="agent-duties">';
      agent.duties.forEach(duty => {
        dutiesHtml += `<li>${duty}</li>`;
      });
      dutiesHtml += '</ul>';
    }

    // 配置示例
    let configHtml = '';
    if (agent.config_example) {
      const config = agent.config_example;
      const configJson = JSON.stringify(config, null, 2);
      configHtml = `
        <div class="config-example">
          <div style="font-size: 0.85em; color: #7f8c8d; margin-bottom: 8px;">配置示例：</div>
          <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 0.8em; overflow-x: auto;">${configJson}</pre>
        </div>
      `;
    }

    html += `
      <div class="agent-card">
        <div class="agent-header">
          <span class="agent-icon">${icon}</span>
          <div>
            <div class="agent-name">${agent.name}</div>
            <div class="agent-role">${agent.role}</div>
          </div>
        </div>
        ${label}
        ${dutiesHtml}
        ${configHtml}
      </div>
    `;
  });

  container.innerHTML = html;
}

// 初始化：从 config.json 加载数据并渲染
fetch('data/config.json')
  .then(res => {
    if (!res.ok) throw new Error('加载 config.json 失败');
    return res.json();
  })
  .then(data => {
    if (data.agents) {
      renderAgentCards(data.agents);
    }
  })
  .catch(err => {
    console.error('渲染 Agent 卡片失败:', err);
    const container = document.getElementById('agent-cards');
    if (container) {
      container.innerHTML = '<p style="color: #e74c3c;">加载 Agent 数据失败，请检查 data/config.json</p>';
    }
  });
