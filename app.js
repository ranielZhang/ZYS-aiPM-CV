(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const scenarioLabels = {
    baseline: '基线延续情景',
    eco: '生态优先情景',
    urban: '城市增长情景'
  };

  const routeContent = {
    decision: {
      title: '环境研究技术路线图',
      'input-1': '研究问题与尺度', 'input-1-desc': '目标、区域与研究时段',
      'input-2': '论文与证据材料', 'input-2-desc': '文献、手册与实验记录',
      'input-3': '空间与情景数据', 'input-3-desc': 'LULC、驱动因子与约束',
      'branch-1': '证据提取与台账', 'branch-1-desc': '来源、尺度与推断边界',
      'branch-2': '情景模拟与验证', 'branch-2-desc': 'LEAS、CARS、OA 与 Kappa',
      merge: '结构化信息模型', 'merge-desc': '问题、数据、方法、验证与输出',
      structure: '技术路线规划', 'structure-desc': '模块、端口、分支与关系',
      generate: '可编辑矢量生成', 'generate-desc': 'draw.io 结构与视觉编码',
      qa: '科学与视觉校验', 'qa-desc': '证据、尺度、关系与可读性',
      'output-1': '技术路线图', 'output-2': '证据台账', 'output-3': 'SVG / PDF'
    },
    scenario: {
      title: '土地利用多情景比较技术路线',
      'input-1': '发展目标与政策约束', 'input-1-desc': '基线、生态与城市目标',
      'input-2': '历史土地利用数据', 'input-2-desc': '起止期 LULC 与变化样本',
      'input-3': '空间驱动与需求', 'input-3-desc': '驱动因子、需求量与转移矩阵',
      'branch-1': 'LEAS 潜力学习', 'branch-1-desc': '扩张样本与驱动贡献',
      'branch-2': 'CARS 空间分配', 'branch-2-desc': '邻域效应、竞争与约束',
      merge: '多情景模拟结果集', 'merge-desc': '统一网格、年份与土地分类',
      structure: '情景差异与权衡分析', 'structure-desc': '数量变化、空间格局与风险',
      generate: '比较图与路线图生成', 'generate-desc': '地图、分支流程与关键结果',
      qa: '结果精度与边界检查', 'qa-desc': 'OA、Kappa、FoM 与可达性',
      'output-1': '情景比较图', 'output-2': '验证指标', 'output-3': '管理启示'
    },
    spatial: {
      title: '时空建模与解释技术路线',
      'input-1': '研究假设与响应变量', 'input-1-desc': '问题、目标与解释边界',
      'input-2': '多源观测数据', 'input-2-desc': '遥感、站点与统计资料',
      'input-3': '空间与时间尺度', 'input-3-desc': '网格、区域、年份与分组',
      'branch-1': '特征工程与对齐', 'branch-1-desc': '清洗、重采样与变量构建',
      'branch-2': '模型训练与解释', 'branch-2-desc': '拟合、预测与特征归因',
      merge: '时空结果数据库', 'merge-desc': '预测、残差、不确定性与解释',
      structure: '尺度关系与外推规划', 'structure-desc': '训练范围、验证层级与限制',
      generate: '时空技术路线生成', 'generate-desc': '方法流程、地图与解释图',
      qa: '交叉验证与科学审查', 'qa-desc': '分组验证、误差与外推边界',
      'output-1': '方法总览图', 'output-2': '预测与解释图', 'output-3': '验证报告'
    },
    watershed: {
      title: '流域源-路径-响应技术路线',
      'input-1': '气候与人类活动驱动', 'input-1-desc': '降雨、土地利用与管理',
      'input-2': '源区与排放证据', 'input-2-desc': '污染源、产出与空间位置',
      'input-3': '河流与近岸观测', 'input-3-desc': '水文、水质与生态响应',
      'branch-1': '源与传输路径识别', 'branch-1-desc': '汇流、滞留与入海过程',
      'branch-2': '环境响应建模', 'branch-2-desc': '河流状态与近岸响应',
      merge: '流域-河流-近岸证据链', 'merge-desc': '驱动、过程、状态与响应',
      structure: '过程机制与尺度规划', 'structure-desc': '陆海连接、时滞与不确定性',
      generate: '流域技术路线生成', 'generate-desc': '源-路径-响应及管理节点',
      qa: '证据与因果边界检查', 'qa-desc': '关联、机制、预测与情景区分',
      'output-1': '流域过程图', 'output-2': '证据链台账', 'output-3': '管理路径'
    }
  };

  let selectedScenario = 'baseline';
  let renderedScenario = 'baseline';
  let renderedDemand = 4;
  let activeGrammar = 'decision';
  let renderedTypes = [];
  let scenarioTimer;
  let figureTimer;
  let toastTimer;

  function seededNoise(x, y, seed) {
    const value = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233 + seed * 20.317) * 43758.5453;
    return value - Math.floor(value);
  }

  function cellType(x, y, scenario, demand) {
    const seed = scenario === 'eco' ? 7 : scenario === 'urban' ? 13 : 3;
    const noise = seededNoise(x, y, seed);
    const river = Math.abs(x - (6.4 + Math.sin(y * .75) * 1.15)) < .7;
    if (river || (x > 12 && y > 7)) return 'water';

    const demandFactor = (demand + 10) / 30;
    const centre = Math.hypot(x - 10.4, y - 4.6);
    if (scenario === 'urban') {
      if (centre < 2.6 + demandFactor * 3.2 || (x > 8 && noise > .72 - demandFactor * .16)) return 'urban';
      if (noise < .24) return 'forest';
      return noise > .78 ? 'urban' : 'crop';
    }
    if (scenario === 'eco') {
      if (x < 7 || y < 3 || noise < .58 + Math.max(0, -demand) * .008) return 'forest';
      if (centre < 2.1 && noise > .55) return 'urban';
      return noise > .86 ? 'urban' : 'crop';
    }
    if (centre < 2.7 + demandFactor * .65 || noise > .88 - demandFactor * .08) return 'urban';
    if (noise < .38) return 'forest';
    return 'crop';
  }

  function generateTypes(scenario, demand) {
    const types = [];
    for (let y = 0; y < 10; y += 1) {
      for (let x = 0; x < 16; x += 1) types.push(cellType(x, y, scenario, demand));
    }
    return types;
  }

  function countTypes(types) {
    return types.reduce((counts, type) => {
      counts[type] += 1;
      return counts;
    }, { forest: 0, crop: 0, urban: 0, water: 0 });
  }

  function updateStats(nextTypes, previousTypes = []) {
    const next = countTypes(nextTypes);
    const previous = previousTypes.length ? countTypes(previousTypes) : null;
    ['forest', 'crop', 'urban', 'water'].forEach((type) => {
      const percent = next[type] / nextTypes.length * 100;
      $(`#stat-${type}`).textContent = `${percent.toFixed(1)}%`;
      const deltaNode = $(`#delta-${type}`);
      deltaNode.classList.remove('positive', 'negative');
      if (!previous) {
        deltaNode.textContent = '当前预览';
        return;
      }
      const oldPercent = previous[type] / previousTypes.length * 100;
      const delta = percent - oldPercent;
      deltaNode.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} 个百分点`;
      if (delta > .05) deltaNode.classList.add('positive');
      if (delta < -.05) deltaNode.classList.add('negative');
    });
  }

  function renderMap(types, animate = false) {
    const map = $('#land-map');
    const fragment = document.createDocumentFragment();
    types.forEach((type, index) => {
      const cell = document.createElement('span');
      cell.className = `map-cell ${type}${animate ? ' generated' : ''}`;
      if (animate) cell.style.animationDelay = `${(index % 16) * 12 + Math.floor(index / 16) * 20}ms`;
      fragment.appendChild(cell);
    });
    map.replaceChildren(fragment);
  }

  function setRunState(text, state = 'ready') {
    const node = $('#run-state');
    node.classList.remove('pending', 'processing');
    if (state !== 'ready') node.classList.add(state);
    node.innerHTML = `<i></i> ${text}`;
  }

  function updateScenarioForm(markPending = true) {
    const demand = Number($('#demand-range')?.value || 4);
    const risky = selectedScenario === 'urban' && demand > 14;
    $('#demand-output').textContent = `${demand >= 0 ? '+' : ''}${demand}%`;

    const card = $('#validation-card');
    card.classList.toggle('warning', risky);
    $('.validation-icon', card).textContent = risky ? '!' : '✓';
    $('#validation-title').textContent = risky ? '当前配置需要检查' : '当前配置可以运行';
    $('#validation-text').textContent = risky ? '高建设需求可能超过当前转移条件' : '需求在概念转移规则下可达';
    $('#validation-status').textContent = risky ? '需检查' : '通过';
    $('#run-scenario').textContent = `生成${scenarioLabels[selectedScenario].replace('情景', '')}预览`;

    if (markPending && (selectedScenario !== renderedScenario || demand !== renderedDemand)) {
      setRunState('配置待生成', 'pending');
    }
  }

  function runScenario() {
    clearTimeout(scenarioTimer);
    const demand = Number($('#demand-range')?.value || 4);
    const nextTypes = generateTypes(selectedScenario, demand);
    const previousTypes = [...renderedTypes];
    const loader = $('#map-loader');
    const button = $('#run-scenario');
    loader.classList.add('active');
    button.disabled = true;
    button.textContent = '正在生成';
    setRunState('正在计算变化', 'processing');

    scenarioTimer = setTimeout(() => {
      renderedScenario = selectedScenario;
      renderedDemand = demand;
      renderedTypes = nextTypes;
      renderMap(nextTypes, true);
      updateStats(nextTypes, previousTypes);
      $('#scenario-title').textContent = `${scenarioLabels[renderedScenario]} · 2035`;
      loader.classList.remove('active');
      button.disabled = false;
      button.textContent = '重新生成预览';
      setRunState('预览已更新');
      showToast('地图与土地占比已按新配置更新');
    }, 850);
  }

  function switchPanel(name) {
    $$('.demo-tab').forEach((tab) => {
      const selected = tab.dataset.panel === name;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    $$('.demo-panel').forEach((panel) => { panel.hidden = panel.id !== `${name}-panel`; });
  }

  function applyRouteContent() {
    const config = routeContent[activeGrammar];
    $('#figure-title').textContent = config.title;
    $$('[data-route]').forEach((node) => {
      const value = config[node.dataset.route];
      if (value) node.textContent = value;
    });
    const diagram = $('#route-diagram');
    diagram.classList.remove('route-generated');
    void diagram.offsetWidth;
    diagram.classList.add('route-generated');
  }

  function buildFigure() {
    clearTimeout(figureTimer);
    const loader = $('#figure-loader');
    const button = $('#build-figure');
    loader.classList.add('active');
    button.disabled = true;
    button.textContent = '正在生成';
    figureTimer = setTimeout(() => {
      applyRouteContent();
      loader.classList.remove('active');
      button.disabled = false;
      button.textContent = '重新生成技术路线图';
      showToast('技术路线图结构和内容已更新');
    }, 700);
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function setupNavigation() {
    const button = $('.menu-button');
    const nav = $('#site-nav');
    button?.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    });
    $$('#site-nav a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('open');
      button?.setAttribute('aria-expanded', 'false');
    }));
  }

  function init() {
    setupNavigation();
    renderedTypes = generateTypes(renderedScenario, renderedDemand);
    renderMap(renderedTypes);
    updateStats(renderedTypes);
    updateScenarioForm(false);

    $$('.demo-tab').forEach((tab) => tab.addEventListener('click', () => switchPanel(tab.dataset.panel)));
    $$('.scenario-button').forEach((button) => button.addEventListener('click', () => {
      selectedScenario = button.dataset.scenario;
      $$('.scenario-button').forEach((item) => item.classList.toggle('active', item === button));
      updateScenarioForm(true);
    }));
    $('#demand-range')?.addEventListener('input', () => updateScenarioForm(true));
    $('#run-scenario')?.addEventListener('click', runScenario);
    $$('.figure-type').forEach((button) => button.addEventListener('click', () => {
      activeGrammar = button.dataset.grammar;
      $$('.figure-type').forEach((item) => item.classList.toggle('active', item === button));
      $('#build-figure').textContent = '生成技术路线图预览';
    }));
    $('#build-figure')?.addEventListener('click', buildFigure);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
