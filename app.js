// Zero Leprosy Project 2025 - Karachi Analytical Dashboard Engine

document.addEventListener('DOMContentLoaded', () => {
  // Check if data is loaded
  if (typeof KARACHI_DATA === 'undefined') {
    console.error('KARACHI_DATA not found. Please ensure data_karachi.js is loaded.');
    return;
  }

  // Application State
  const state = {
    selectedOutcome: 'all',
    selectedStatus: 'all',
    selectedQuarter: 'all', // 'all', 'Q1', 'Q2', 'Q3', 'Q4'
    searchQuery: '',
    currentView: 'cards', // 'cards', 'matrix', 'charts'
    expandedCards: new Set(),
    theme: localStorage.getItem('zlp_theme') || 'dark'
  };

  // Set Theme
  document.documentElement.setAttribute('data-theme', state.theme);

  // Initialize Elements
  initHeader();
  renderExecutiveKPIs();
  renderOutcomeKPIs();
  setupEventListeners();
  renderCurrentView();

  // 1. Initialize Header
  function initHeader() {
    const bannerSubtitle = document.getElementById('banner-subtitle');
    if (bannerSubtitle) {
      bannerSubtitle.textContent = `Marie Adelaide Leprosy Centre • 2025 Target vs. Achievement Analysis • 87 Program Activities`;
    }
  }

  // 2. Render Executive Tier 1 KPIs
  function renderExecutiveKPIs() {
    const s = KARACHI_DATA.summary;
    const formatNum = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 });

    // Planned
    const elPlanned = document.getElementById('kpi-total-planned');
    if (elPlanned) elPlanned.textContent = formatNum(s.totalPlanned);

    // Achieved
    const elAchieved = document.getElementById('kpi-total-achieved');
    if (elAchieved) elAchieved.textContent = formatNum(s.totalAchieved);

    // Overall %
    const elPct = document.getElementById('kpi-overall-pct');
    const elPctPill = document.getElementById('kpi-overall-pct-pill');
    const elProgressBar = document.getElementById('kpi-overall-progress');

    if (elPct) elPct.textContent = `${s.overallPct}%`;
    if (elPctPill) {
      elPctPill.className = `kpi-pct-pill ${s.overallPct >= 100 ? 'pill-emerald' : s.overallPct >= 70 ? 'pill-blue' : 'pill-amber'}`;
      elPctPill.innerHTML = `<span>${s.overallPct >= 100 ? '▲' : '●'}</span> ${s.overallPct}% Rate`;
    }
    if (elProgressBar) {
      elProgressBar.style.width = `${Math.min(s.overallPct, 100)}%`;
      elProgressBar.style.backgroundColor = s.overallPct >= 100 ? '#10b981' : s.overallPct >= 70 ? '#3b82f6' : '#f59e0b';
    }

    // Health Status Breakdown
    const elStatusWrap = document.getElementById('kpi-status-breakdown');
    if (elStatusWrap) {
      elStatusWrap.innerHTML = `
        <span class="health-pill pill-emerald" title="Activities meeting or exceeding 100% target">
          <strong>${s.statusCounts.exceeded}</strong> Target Met (≥100%)
        </span>
        <span class="health-pill pill-blue" title="Activities on track between 70% and 99.9%">
          <strong>${s.statusCounts.ontrack}</strong> On Track (70-99%)
        </span>
        <span class="health-pill pill-amber" title="Activities with 1% to 69.9% progress">
          <strong>${s.statusCounts.inprogress}</strong> In Progress (1-69%)
        </span>
        <span class="health-pill pill-slate" title="Activities scheduled or not started">
          <strong>${s.statusCounts.notstarted}</strong> Not Started (0%)
        </span>
      `;
    }

    // Quarterly Mini Progress
    const elQProgress = document.getElementById('kpi-quarterly-progress');
    if (elQProgress) {
      const q3 = s.quarters.Q3;
      const q4 = s.quarters.Q4;
      elQProgress.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
          <span>Q3: <strong>${formatNum(q3.achieved)}</strong> / ${formatNum(q3.planned)}</span>
          <span style="color: #10b981; font-weight: 700;">${q3.pct}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
          <span>Q4: <strong>${formatNum(q4.achieved)}</strong> / ${formatNum(q4.planned)}</span>
          <span style="color: #10b981; font-weight: 700;">${q4.pct}%</span>
        </div>
      `;
    }
  }

  // 3. Render Outcome / Pillar KPI Cards (Tier 2)
  function renderOutcomeKPIs() {
    const grid = document.getElementById('outcomes-kpi-grid');
    if (!grid) return;

    const outcomes = KARACHI_DATA.summary.outcomes;
    const formatNum = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

    grid.innerHTML = Object.keys(outcomes).map(k => {
      const o = outcomes[k];
      const isActive = state.selectedOutcome === k;
      const colorClass = o.pct >= 70 ? 'pill-emerald' : (o.pct >= 50 ? 'pill-amber' : 'pill-rose');

      return `
        <div class="outcome-card ${isActive ? 'active-outcome' : ''}" data-outcome="${k}" title="${o.meta.title}">
          <div class="outcome-top">
            <div class="outcome-icon-box" style="background: ${o.meta.color}22; color: ${o.meta.color}; border: 1px solid ${o.meta.color}44;">
              ${o.meta.icon}
            </div>
            <div>
              <div class="outcome-name">${o.meta.shortTitle}</div>
              <div class="outcome-activities-count">${o.count} Program Activities</div>
            </div>
          </div>

          <div class="outcome-metrics-row">
            <div>
              <div class="metric-col-title">Target</div>
              <div class="metric-col-val">${formatNum(o.planned)}</div>
            </div>
            <div>
              <div class="metric-col-title">Achieved</div>
              <div class="metric-col-val" style="color: ${o.meta.color};">${formatNum(o.achieved)}</div>
            </div>
            <div>
              <div class="metric-col-title">Achievement</div>
              <div class="metric-col-val">
                <span class="kpi-pct-pill ${colorClass}" style="padding: 0.15rem 0.45rem; font-size: 0.78rem;">
                  ${o.pct}%
                </span>
              </div>
            </div>
          </div>

          <div class="progress-bar-wrap" style="height: 5px;">
            <div class="progress-bar-fill" style="width: ${Math.min(o.pct, 100)}%; background-color: ${o.meta.color};"></div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener to outcome cards for instant filtering
    grid.querySelectorAll('.outcome-card').forEach(card => {
      card.addEventListener('click', () => {
        const outId = card.getAttribute('data-outcome');
        if (state.selectedOutcome === outId) {
          state.selectedOutcome = 'all'; // toggle off
        } else {
          state.selectedOutcome = outId;
        }
        // Sync outcome dropdown
        const select = document.getElementById('filter-outcome');
        if (select) select.value = state.selectedOutcome;
        
        renderOutcomeKPIs();
        renderCurrentView();
      });
    });
  }

  // 4. Setup Event Listeners
  function setupEventListeners() {
    // View Switcher
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentView = btn.getAttribute('data-view');
        renderCurrentView();
      });
    });

    // Quarter Selector
    const qSelect = document.getElementById('filter-quarter');
    if (qSelect) {
      qSelect.addEventListener('change', e => {
        state.selectedQuarter = e.target.value;
        renderCurrentView();
      });
    }

    // Outcome Dropdown
    const outSelect = document.getElementById('filter-outcome');
    if (outSelect) {
      outSelect.addEventListener('change', e => {
        state.selectedOutcome = e.target.value;
        renderOutcomeKPIs();
        renderCurrentView();
      });
    }

    // Status Filter
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', e => {
        state.selectedStatus = e.target.value;
        renderCurrentView();
      });
    }

    // Live Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderCurrentView();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.selectedOutcome = 'all';
        state.selectedStatus = 'all';
        state.selectedQuarter = 'all';
        state.searchQuery = '';
        if (qSelect) qSelect.value = 'all';
        if (outSelect) outSelect.value = 'all';
        if (statusSelect) statusSelect.value = 'all';
        if (searchInput) searchInput.value = '';
        renderOutcomeKPIs();
        renderCurrentView();
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('zlp_theme', state.theme);
        themeBtn.innerHTML = state.theme === 'dark' ? '🌙 Theme' : '☀️ Theme';
        if (state.currentView === 'charts') {
          renderChartsView();
        }
      });
    }

    // Export CSV
    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportToCSV);
    }
  }

  // 5. Filter Activities based on State
  function getFilteredActivities() {
    return KARACHI_DATA.activities.filter(a => {
      // Outcome filter
      if (state.selectedOutcome !== 'all' && a.outcome !== state.selectedOutcome) {
        return false;
      }
      // Status filter
      if (state.selectedStatus !== 'all') {
        const isQuarter = state.selectedQuarter !== 'all';
        const pctVal = isQuarter ? (a.quarters[state.selectedQuarter] ? a.quarters[state.selectedQuarter].pct : 0) : a.pct_total;
        
        let code = 'not_achieved';
        if (pctVal >= 70.0) {
          code = 'fully_achieved';
        } else if (pctVal >= 50.0) {
          code = 'partially_achieved';
        }

        if (code !== state.selectedStatus) {
          return false;
        }
      }
      // Search query
      if (state.searchQuery) {
        const query = state.searchQuery;
        const matchCode = a.code.toLowerCase().includes(query);
        const matchTitle = a.title.toLowerCase().includes(query);
        const matchSub = a.subTitle.toLowerCase().includes(query);
        if (!matchCode && !matchTitle && !matchSub) return false;
      }
      return true;
    });
  }

  // 6. Render View based on state.currentView
  function renderCurrentView() {
    const cardsSection = document.getElementById('section-cards-view');
    const matrixSection = document.getElementById('section-matrix-view');
    const chartsSection = document.getElementById('section-charts-view');
    const filteredCountBadge = document.getElementById('filtered-count-badge');

    const filtered = getFilteredActivities();
    if (filteredCountBadge) {
      filteredCountBadge.textContent = `Showing ${filtered.length} of ${KARACHI_DATA.activities.length} activities`;
    }

    // Toggle container visibilities
    cardsSection.style.display = state.currentView === 'cards' ? 'block' : 'none';
    matrixSection.style.display = state.currentView === 'matrix' ? 'block' : 'none';
    chartsSection.style.display = state.currentView === 'charts' ? 'block' : 'none';

    if (state.currentView === 'cards') {
      renderCardsView(filtered);
    } else if (state.currentView === 'matrix') {
      renderMatrixView(filtered);
    } else if (state.currentView === 'charts') {
      renderChartsView(filtered);
    }
  }

  // 7. Render Activity KPI Cards View (Tier 4)
  function renderCardsView(activities) {
    const grid = document.getElementById('activities-cards-grid');
    if (!grid) return;

    if (activities.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-glass);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">No activities match your filters</h3>
          <p>Try clearing search keywords or switching outcome filters.</p>
        </div>
      `;
      return;
    }

    const formatNum = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 });
    const isQuarter = state.selectedQuarter !== 'all';

    grid.innerHTML = activities.map(a => {
      // Determine values depending on selected quarter
      let plannedVal, achievedVal, pctVal;
      if (isQuarter) {
        const qObj = a.quarters[state.selectedQuarter];
        plannedVal = qObj.planned;
        achievedVal = qObj.achieved;
        pctVal = qObj.pct;
      } else {
        plannedVal = a.planned_total;
        achievedVal = a.achieved_total;
        pctVal = a.pct_total;
      }

      // Activity thresholds per user criteria:
      // >= 70%: Target Achieved (emerald/green)
      // 50% - 69.9%: Partially Achieved (amber/yellow)
      // < 50%: Not Achieved (rose/red)
      let pillClass = 'pill-rose';
      let statusBadge = '✕ Not Achieved';
      let progressColor = '#f43f5e';

      if (pctVal >= 70.0) {
        pillClass = 'pill-emerald';
        statusBadge = '✓ Target Achieved';
        progressColor = '#10b981';
      } else if (pctVal >= 50.0) {
        pillClass = 'pill-amber';
        statusBadge = '▲ Partially Achieved';
        progressColor = '#f59e0b';
      }

      const isExpanded = state.expandedCards.has(a.id);

      return `
        <div class="activity-kpi-card ${isExpanded ? 'card-expanded' : ''}" id="${a.id}">
          <div>
            <div class="act-card-header">
              <span class="act-code-badge">${a.code}</span>
              <span class="health-pill ${pillClass}">
                ${statusBadge}
              </span>
            </div>

            <div class="act-title">${a.title}</div>

            <div class="act-core-kpi">
              <div class="act-kpi-row">
                <div class="act-total-numbers">
                  <div class="act-num-item">
                    <span class="act-num-label">${isQuarter ? state.selectedQuarter : 'Annual'} Target</span>
                    <span class="act-num-val">${formatNum(plannedVal)}</span>
                  </div>
                  <div class="act-num-item">
                    <span class="act-num-label">Achieved</span>
                    <span class="act-num-val" style="color: var(--text-accent);">${formatNum(achievedVal)}</span>
                  </div>
                </div>

                <div>
                  <span class="kpi-pct-pill ${pillClass}">
                    ${pctVal}%
                  </span>
                </div>
              </div>

              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${Math.min(pctVal, 100)}%; background-color: ${progressColor};"></div>
              </div>

              <div class="quarters-chip-grid">
                ${['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
                  const qInfo = a.quarters[q];
                  const qClass = qInfo.pct >= 70.0 ? 'pill-emerald' : (qInfo.pct >= 50.0 ? 'pill-amber' : 'pill-rose');
                  return `
                    <div class="quarter-chip ${state.selectedQuarter === q ? 'pill-cyan' : ''}">
                      <div class="quarter-chip-title">${q}</div>
                      <div class="quarter-chip-val ${qClass}" style="border-radius: 4px; padding: 0.1rem 0;">${qInfo.pct}%</div>
                      <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 0.15rem;">${formatNum(qInfo.achieved)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div>
            <button class="expand-details-btn" data-act-id="${a.id}">
              ${isExpanded ? '▲ Hide 12-Month Details' : '▼ Expand 12-Month Breakdown'}
            </button>

            ${isExpanded ? `
              <div class="monthly-table-wrap">
                <table class="monthly-breakdown-table">
                  <thead>
                    <tr>
                      <th style="position: sticky; left: 0; z-index: 2; min-width: 55px; background: var(--bg-elevated);">Metric</th>
                      ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => `<th>${m}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 600; text-align: left; color: var(--text-muted); position: sticky; left: 0; z-index: 1; background: var(--bg-elevated);">Target</td>
                      ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => `<td>${formatNum(a.months[m].planned)}</td>`).join('')}
                    </tr>
                    <tr style="color: var(--text-accent); font-weight: 700;">
                      <td style="text-align: left; position: sticky; left: 0; z-index: 1; background: var(--bg-elevated);">Achvd</td>
                      ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => `<td>${formatNum(a.months[m].achieved)}</td>`).join('')}
                    </tr>
                    <tr style="font-weight: 600;">
                      <td style="text-align: left; color: #10b981; position: sticky; left: 0; z-index: 1; background: var(--bg-elevated);">%</td>
                      ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => {
                        const mpct = a.months[m].pct;
                        const col = mpct >= 70.0 ? '#10b981' : (mpct >= 50.0 ? '#f59e0b' : (mpct > 0 ? '#f43f5e' : 'inherit'));
                        return `<td style="color: ${col};">${mpct}%</td>`;
                      }).join('')}
                    </tr>
                  </tbody>
                </table>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach listener for monthly toggle
    grid.querySelectorAll('.expand-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-act-id');
        if (state.expandedCards.has(id)) {
          state.expandedCards.delete(id);
        } else {
          state.expandedCards.add(id);
        }
        renderCardsView(activities);
      });
    });
  }

  // 8. Render Spreadsheet Matrix Table View (Excel format)
  function renderMatrixView(activities) {
    const tableContainer = document.getElementById('table-matrix-container');
    if (!tableContainer) return;

    if (activities.length === 0) {
      tableContainer.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No activities match filters.</div>`;
      return;
    }

    const formatNum = n => Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let html = `
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="min-width: 70px;">Code</th>
            <th style="min-width: 320px;">Activity Description</th>
            <th style="min-width: 80px;">Type</th>
            <th>Jan</th>
            <th>Feb</th>
            <th>Mar</th>
            <th class="quarter-col-header">1st Qtr</th>
            <th>Apr</th>
            <th>May</th>
            <th>Jun</th>
            <th class="quarter-col-header">2nd Qtr</th>
            <th>Jul</th>
            <th>Aug</th>
            <th>Sep</th>
            <th class="quarter-col-header">3rd Qtr</th>
            <th>Oct</th>
            <th>Nov</th>
            <th>Dec</th>
            <th class="quarter-col-header">4th Qtr</th>
            <th class="total-col-header">Grand Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    activities.forEach(a => {
      // Planned Row
      html += `
        <tr class="planned-row">
          <td rowspan="3" style="font-family: monospace; font-weight: 700; color: var(--text-accent); text-align: left; vertical-align: top;">${a.code}</td>
          <td rowspan="3" style="text-align: left; vertical-align: top; max-width: 380px; white-space: normal; line-height: 1.35;">
            <div style="font-weight: 600;">${a.title}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">${a.subTitle}</div>
          </td>
          <td style="font-weight: 600; color: var(--text-muted); text-align: left;">Planned</td>
          <td>${formatNum(a.months.Jan.planned)}</td>
          <td>${formatNum(a.months.Feb.planned)}</td>
          <td>${formatNum(a.months.Mar.planned)}</td>
          <td class="quarter-col-cell">${formatNum(a.quarters.Q1.planned)}</td>
          <td>${formatNum(a.months.Apr.planned)}</td>
          <td>${formatNum(a.months.May.planned)}</td>
          <td>${formatNum(a.months.Jun.planned)}</td>
          <td class="quarter-col-cell">${formatNum(a.quarters.Q2.planned)}</td>
          <td>${formatNum(a.months.Jul.planned)}</td>
          <td>${formatNum(a.months.Aug.planned)}</td>
          <td>${formatNum(a.months.Sep.planned)}</td>
          <td class="quarter-col-cell">${formatNum(a.quarters.Q3.planned)}</td>
          <td>${formatNum(a.months.Oct.planned)}</td>
          <td>${formatNum(a.months.Nov.planned)}</td>
          <td>${formatNum(a.months.Dec.planned)}</td>
          <td class="quarter-col-cell">${formatNum(a.quarters.Q4.planned)}</td>
          <td class="total-col-cell">${formatNum(a.planned_total)}</td>
        </tr>
      `;

      // Achieved Row
      html += `
        <tr class="achieved-row">
          <td style="font-weight: 700; color: var(--text-accent); text-align: left;">Achieved</td>
          <td>${formatNum(a.months.Jan.achieved)}</td>
          <td>${formatNum(a.months.Feb.achieved)}</td>
          <td>${formatNum(a.months.Mar.achieved)}</td>
          <td class="quarter-col-cell" style="color: var(--text-accent);">${formatNum(a.quarters.Q1.achieved)}</td>
          <td>${formatNum(a.months.Apr.achieved)}</td>
          <td>${formatNum(a.months.May.achieved)}</td>
          <td>${formatNum(a.months.Jun.achieved)}</td>
          <td class="quarter-col-cell" style="color: var(--text-accent);">${formatNum(a.quarters.Q2.achieved)}</td>
          <td>${formatNum(a.months.Jul.achieved)}</td>
          <td>${formatNum(a.months.Aug.achieved)}</td>
          <td>${formatNum(a.months.Sep.achieved)}</td>
          <td class="quarter-col-cell" style="color: var(--text-accent);">${formatNum(a.quarters.Q3.achieved)}</td>
          <td>${formatNum(a.months.Oct.achieved)}</td>
          <td>${formatNum(a.months.Nov.achieved)}</td>
          <td>${formatNum(a.months.Dec.achieved)}</td>
          <td class="quarter-col-cell" style="color: var(--text-accent);">${formatNum(a.quarters.Q4.achieved)}</td>
          <td class="total-col-cell" style="color: var(--text-accent);">${formatNum(a.achieved_total)}</td>
        </tr>
      `;

      // % Row
      const pctCell = val => {
        const color = val >= 70.0 ? '#10b981' : (val >= 50.0 ? '#f59e0b' : (val > 0 ? '#f43f5e' : 'var(--text-muted)'));
        return `<span style="color: ${color}; font-weight: 700;">${val}%</span>`;
      };

      html += `
        <tr class="pct-row">
          <td style="font-weight: 700; color: #10b981; text-align: left;">%</td>
          <td>${pctCell(a.months.Jan.pct)}</td>
          <td>${pctCell(a.months.Feb.pct)}</td>
          <td>${pctCell(a.months.Mar.pct)}</td>
          <td class="quarter-col-cell">${pctCell(a.quarters.Q1.pct)}</td>
          <td>${pctCell(a.months.Apr.pct)}</td>
          <td>${pctCell(a.months.May.pct)}</td>
          <td>${pctCell(a.months.Jun.pct)}</td>
          <td class="quarter-col-cell">${pctCell(a.quarters.Q2.pct)}</td>
          <td>${pctCell(a.months.Jul.pct)}</td>
          <td>${pctCell(a.months.Aug.pct)}</td>
          <td>${pctCell(a.months.Sep.pct)}</td>
          <td class="quarter-col-cell">${pctCell(a.quarters.Q3.pct)}</td>
          <td>${pctCell(a.months.Oct.pct)}</td>
          <td>${pctCell(a.months.Nov.pct)}</td>
          <td>${pctCell(a.months.Dec.pct)}</td>
          <td class="quarter-col-cell">${pctCell(a.quarters.Q4.pct)}</td>
          <td class="total-col-cell">${pctCell(a.pct_total)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
  }

  // 9. Render Visual Charts View (Chart.js)
  let charts = {};
  function renderChartsView(activities) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet.');
      return;
    }

    // Destroy existing chart instances to avoid canvas reuse conflicts
    Object.keys(charts).forEach(key => {
      if (charts[key]) charts[key].destroy();
    });

    const isDark = state.theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)';
    const textColor = isDark ? '#9ca3af' : '#475569';

    // Chart 1: Target vs Achieved by Outcome
    const ctxOutcomes = document.getElementById('chart-outcomes');
    if (ctxOutcomes) {
      const outcomes = KARACHI_DATA.summary.outcomes;
      const shortLabels = {
        '1': 'Outcome 1: Case Detection & SDR-PEP',
        '2': 'Outcome 2: Comprehensive Care Services',
        '3': 'Outcome 3: Post-Elimination Phase',
        '4': 'Outcome 4: TB Control Support',
        '5': 'Outcome 5: Accompanying & M&E'
      };
      const labels = Object.keys(outcomes).map(k => shortLabels[k] || `Outcome ${k}`);
      const plannedData = Object.keys(outcomes).map(k => outcomes[k].planned);
      const achievedData = Object.keys(outcomes).map(k => outcomes[k].achieved);

      charts.outcomes = new Chart(ctxOutcomes, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Planned Target',
              data: plannedData,
              backgroundColor: 'rgba(56, 189, 248, 0.65)',
              borderColor: '#38bdf8',
              borderWidth: 1.5,
              borderRadius: 6
            },
            {
              label: 'Actual Achieved',
              data: achievedData,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderColor: '#10b981',
              borderWidth: 1.5,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor } }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor } }
          }
        }
      });
    }

    // Chart 2: Health Status Distribution (Doughnut)
    const ctxHealth = document.getElementById('chart-health');
    if (ctxHealth) {
      const counts = KARACHI_DATA.summary.statusCounts;
      charts.health = new Chart(ctxHealth, {
        type: 'doughnut',
        data: {
          labels: ['Fully Achieved (≥70%)', 'Partially Achieved (50-69%)', 'Target Not Achieved (<50%)'],
          datasets: [{
            data: [counts.fully_achieved, counts.partially_achieved, counts.not_achieved],
            backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
            borderWidth: 2,
            borderColor: isDark ? '#111827' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor } }
          },
          cutout: '68%'
        }
      });
    }

    // Chart 3: Quarterly Output Momentum
    const ctxQuarterly = document.getElementById('chart-quarterly');
    if (ctxQuarterly) {
      const q = KARACHI_DATA.summary.quarters;
      charts.quarterly = new Chart(ctxQuarterly, {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              type: 'bar',
              label: 'Planned Target',
              data: [q.Q1.planned, q.Q2.planned, q.Q3.planned, q.Q4.planned],
              backgroundColor: 'rgba(148, 163, 184, 0.4)',
              borderRadius: 6
            },
            {
              type: 'bar',
              label: 'Achieved Output',
              data: [q.Q1.achieved, q.Q2.achieved, q.Q3.achieved, q.Q4.achieved],
              backgroundColor: '#3b82f6',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor } } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor } }
          }
        }
      });
    }

    // Chart 4: Top 8 Activities by Target Volume
    const ctxTop = document.getElementById('chart-top-activities');
    if (ctxTop) {
      const topActs = [...KARACHI_DATA.activities]
        .sort((a, b) => b.planned_total - a.planned_total)
        .slice(0, 8);

      charts.top = new Chart(ctxTop, {
        type: 'bar',
        indexAxis: 'y',
        data: {
          labels: topActs.map(a => `${a.code}: ${a.title.slice(0, 32)}...`),
          datasets: [
            {
              label: 'Planned Target',
              data: topActs.map(a => a.planned_total),
              backgroundColor: 'rgba(56, 189, 248, 0.5)',
              borderRadius: 4
            },
            {
              label: 'Achieved Output',
              data: topActs.map(a => a.achieved_total),
              backgroundColor: '#10b981',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor } } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } }
          }
        }
      });
    }
  }

  // 10. Export to CSV
  function exportToCSV() {
    const acts = getFilteredActivities();
    let csv = "Code,Activity Description,Outcome,Sub Category,Annual Planned,Annual Achieved,Achievement %,Q1 Planned,Q1 Achieved,Q2 Planned,Q2 Achieved,Q3 Planned,Q3 Achieved,Q4 Planned,Q4 Achieved\n";
    
    acts.forEach(a => {
      const cleanTitle = `"${a.title.replace(/"/g, '""')}"`;
      const cleanSub = `"${a.subTitle.replace(/"/g, '""')}"`;
      csv += `${a.code},${cleanTitle},Outcome ${a.outcome},${cleanSub},${a.planned_total},${a.achieved_total},${a.pct_total}%,${a.quarters.Q1.planned},${a.quarters.Q1.achieved},${a.quarters.Q2.planned},${a.quarters.Q2.achieved},${a.quarters.Q3.planned},${a.quarters.Q3.achieved},${a.quarters.Q4.planned},${a.quarters.Q4.achieved}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Zero_Leprosy_Karachi_KPI_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
