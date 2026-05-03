// render-labels.js - 标签树渲染（数据驱动）
function renderLabelTree(labelsData) {
  const container = document.getElementById('label-tree');
  if (!container) return;

  let html = '';
  
  // 遍历每个标签组
  for (const [groupName, labels] of Object.entries(labelsData)) {
    const isCollapsed = false; // 默认展开
    
    html += `
      <div class="label-group" id="group-${groupName.replace(/\s+/g, '-')}">
        <div class="label-group-header" onclick="toggleGroup('${groupName}')">
          <span class="group-name">${groupName}</span>
          <span class="label-count">${labels.length} 个标签</span>
        </div>
        <div class="label-group-body" id="body-${groupName.replace(/\s+/g, '-')}">
    `;
    
    // 遍历组内标签
    labels.forEach(label => {
      html += `
        <div class="label-item">
          <div class="label-color" style="background: ${label.color};"></div>
          <span class="label-name">${label.name}</span>
          <span class="label-desc">${label.desc || ''}</span>
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  container.innerHTML = html;
}

// 折叠/展开切换
function toggleGroup(groupName) {
  const bodyId = `body-${groupName.replace(/\s+/g, '-')}`;
  const groupId = `group-${groupName.replace(/\s+/g, '-')}`;
  
  const body = document.getElementById(bodyId);
  const group = document.getElementById(groupId);
  
  if (body && group) {
    group.classList.toggle('collapsed');
    body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }
}

// 初始化：从 config.json 加载数据并渲染
fetch('data/config.json')
  .then(res => {
    if (!res.ok) throw new Error('加载 config.json 失败');
    return res.json();
  })
  .then(data => {
    if (data.labels) {
      renderLabelTree(data.labels);
    }
  })
  .catch(err => {
    console.error('渲染标签树失败:', err);
    document.getElementById('label-tree').innerHTML = 
      '<p style="color: #e74c3c;">加载标签数据失败，请检查 data/config.json</p>';
  });
