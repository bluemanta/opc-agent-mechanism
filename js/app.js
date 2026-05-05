const text = (value) => String(value ?? '');

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderList(items, className = '') {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderPositioning(data) {
  document.getElementById('positioning-title').textContent = data.title;
  document.getElementById('positioning-subtitle').textContent = data.subtitle;
  document.getElementById('principle-list').innerHTML = data.principles
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
}

function renderArchitecture(architecture) {
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

function render(data) {
  renderPositioning(data.positioning);
  renderArchitecture(data.architecture);
  renderContextLayers(data.context_layers);
  renderWorkflow(data.workflow);
  renderIssueTemplate(data.issue_template);
  renderExecutors(data.executors);
  renderRoutine(data.daily_routine);
  renderRoadmap(data.roadmap);
}

fetch('data/config.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('加载 data/config.json 失败');
    }
    return response.json();
  })
  .then(render)
  .catch((error) => {
    document.body.innerHTML = `
      <main class="shell">
        <section class="section error-state">
          <h1>页面数据加载失败</h1>
          <p>${escapeHtml(error.message)}</p>
        </section>
      </main>
    `;
  });
