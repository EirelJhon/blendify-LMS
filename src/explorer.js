import { executeRawSql, getTableStats, resetDatabaseToSeed, downloadDatabaseFile } from './db.js';

/**
 * Interactive SQLite Database & API Explorer Modal Component
 */
export function initDatabaseExplorer() {
  // Check if explorer modal already exists
  let modal = document.getElementById('dbExplorerModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay db-explorer-modal-overlay';
    modal.id = 'dbExplorerModal';
    modal.innerHTML = `
      <div class="modal-box db-explorer-modal-box" role="dialog" aria-modal="true" aria-labelledby="dbExplorerTitle">
        <div class="db-explorer-header">
          <div class="db-explorer-title-wrap">
            <div class="db-explorer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            </div>
            <div>
              <div class="db-title-row">
                <h3 class="modal-title" id="dbExplorerTitle">Interactive SQLite Database &amp; API Explorer</h3>
                <span class="db-engine-badge"><span class="db-pulse-dot"></span> SQLite 3 (WebAssembly)</span>
              </div>
              <p class="db-explorer-subtitle">Inspect relational tables, run live SQL queries, and test backend data models</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btnCloseDbExplorer" aria-label="Close Database Explorer">✕</button>
        </div>

        <div class="db-explorer-body">
          <!-- Table Navigator Tabs -->
          <div class="db-tables-bar">
            <span class="db-bar-label">Tables:</span>
            <div class="db-table-chips" id="dbTableChips">
              <button type="button" class="db-table-chip active" data-table="users">
                <span>users</span>
                <span class="chip-count" id="stat-users">0</span>
              </button>
              <button type="button" class="db-table-chip" data-table="classroom_portals">
                <span>classroom_portals</span>
                <span class="chip-count" id="stat-classroom_portals">0</span>
              </button>
              <button type="button" class="db-table-chip" data-table="learning_materials">
                <span>learning_materials</span>
                <span class="chip-count" id="stat-learning_materials">0</span>
              </button>
              <button type="button" class="db-table-chip" data-table="uploaded_files">
                <span>uploaded_files</span>
                <span class="chip-count" id="stat-uploaded_files">0</span>
              </button>
              <button type="button" class="db-table-chip" data-table="quizzes">
                <span>quizzes</span>
                <span class="chip-count" id="stat-quizzes">0</span>
              </button>
              <button type="button" class="db-table-chip" data-table="student_activities">
                <span>student_activities</span>
                <span class="chip-count" id="stat-student_activities">0</span>
              </button>
            </div>
          </div>

          <!-- Interactive SQL Console & Presets -->
          <div class="db-query-section">
            <div class="db-query-top-row">
              <span class="db-query-label">SQL Query Console</span>
              <div class="db-presets-wrap">
                <span class="preset-label">Quick Presets:</span>
                <button type="button" class="db-preset-btn" data-sql="SELECT * FROM users;">Users</button>
                <button type="button" class="db-preset-btn" data-sql="SELECT * FROM classroom_portals;">Portals</button>
                <button type="button" class="db-preset-btn" data-sql="SELECT title, category, author, downloads_count FROM learning_materials ORDER BY downloads_count DESC;">Top Downloads</button>
                <button type="button" class="db-preset-btn" data-sql="SELECT id, name, mime_type, file_size, uploaded_by, portal_tag, created_at FROM uploaded_files ORDER BY id DESC;">Saved Files</button>
                <button type="button" class="db-preset-btn" data-sql="SELECT * FROM student_activities ORDER BY id DESC LIMIT 10;">Recent Activity</button>
                <button type="button" class="db-preset-btn" data-sql="SELECT category, count(*) as count, sum(downloads_count) as total_downloads FROM learning_materials GROUP BY category;">Categories Aggregation</button>
              </div>
            </div>

            <div class="db-editor-wrap">
              <textarea id="dbSqlInput" class="db-sql-textarea" rows="3" spellcheck="false" placeholder="Enter standard SQLite query (e.g. SELECT * FROM users)..." aria-label="SQLite Query Editor">SELECT * FROM users;</textarea>

              <div class="db-editor-actions">
                <span class="db-shortcut-hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run</span>
                <button type="button" class="btn-primary-sm btn-run-sql" id="btnExecuteSql">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Execute SQL</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Query Execution Status & Metadata -->
          <div class="db-meta-bar" id="dbMetaBar">
            <div class="db-status-info">
              <span class="db-rows-stat" id="dbRowsStat">3 rows returned</span>
              <span class="db-time-stat" id="dbTimeStat">0.12 ms</span>
            </div>
            <div class="db-table-actions">
              <button type="button" class="db-action-link" id="btnRefreshDbExplorer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span>Refresh Live Data</span>
              </button>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div class="db-error-alert" id="dbErrorAlert" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span id="dbErrorMessage">SQL Error</span>
          </div>

          <!-- Interactive Results Table Viewport -->
          <div class="db-results-container" id="dbResultsContainer">
            <table class="db-results-table" id="dbResultsTable">
              <thead><tr id="dbResultsThead"></tr></thead>
              <tbody id="dbResultsTbody"></tbody>
            </table>
          </div>
        </div>

        <div class="db-explorer-footer">
          <div class="db-footer-left">
            <button type="button" class="btn-secondary-sm" id="btnResetSeedData">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              <span>Reset to Seed Data</span>
            </button>
            <button type="button" class="btn-secondary-sm" id="btnExportDbFile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download .sqlite File</span>
            </button>
          </div>
          <button type="button" class="btn-secondary-sm" id="btnDismissDbExplorer">Close Explorer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Elements
  const btnClose = document.getElementById('btnCloseDbExplorer');
  const btnDismiss = document.getElementById('btnDismissDbExplorer');
  const btnExecute = document.getElementById('btnExecuteSql');
  const sqlInput = document.getElementById('dbSqlInput');
  const tableThead = document.getElementById('dbResultsThead');
  const tableTbody = document.getElementById('dbResultsTbody');
  const rowsStat = document.getElementById('dbRowsStat');
  const timeStat = document.getElementById('dbTimeStat');
  const errorAlert = document.getElementById('dbErrorAlert');
  const errorMessage = document.getElementById('dbErrorMessage');
  const tableChips = document.getElementById('dbTableChips');
  const btnRefresh = document.getElementById('btnRefreshDbExplorer');
  const btnReset = document.getElementById('btnResetSeedData');
  const btnExport = document.getElementById('btnExportDbFile');

  // Open & Close methods
  function openExplorer() {
    modal.classList.add('open');
    updateStats();
    runCurrentQuery();
    setTimeout(() => sqlInput?.focus(), 80);
  }

  function closeExplorer() {
    modal.classList.remove('open');
  }

  // Update table row count badges
  async function updateStats() {
    try {
      const stats = await getTableStats();
      for (const [table, count] of Object.entries(stats)) {
        const badge = document.getElementById(`stat-${table}`);
        if (badge) badge.textContent = count;
      }
    } catch (e) {
      console.warn('[Explorer] updateStats error:', e);
    }
  }

  // Execute SQL in the runner
  async function runCurrentQuery() {
    const sql = sqlInput.value.trim();
    if (!sql) return;

    errorAlert.style.display = 'none';

    const res = await executeRawSql(sql);
    if (!res.success) {
      errorAlert.style.display = 'flex';
      errorMessage.textContent = res.error;
      rowsStat.textContent = '0 rows';
      timeStat.textContent = `${res.timeMs} ms`;
      tableThead.innerHTML = '';
      tableTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#EF4444; padding:24px;">Query failed: ${res.error}</td></tr>`;
      return;
    }

    // Update counts
    rowsStat.textContent = `${res.rowCount} row${res.rowCount === 1 ? '' : 's'}`;
    timeStat.textContent = `${res.timeMs} ms`;

    // Render columns
    tableThead.innerHTML = res.columns.map(col => `<th>${col}</th>`).join('');

    // Render rows
    if (res.values.length === 0) {
      tableTbody.innerHTML = `<tr><td colspan="${res.columns.length}" style="text-align:center; color:#8E92A2; padding:24px;">No records matched this query.</td></tr>`;
    } else {
      tableTbody.innerHTML = res.values.map(row => {
        return `<tr>${row.map(cell => {
          if (cell === null || cell === undefined) return `<td class="cell-null">NULL</td>`;
          const str = String(cell);
          if (str.startsWith('#PORTAL')) return `<td><strong class="cell-tag">${str}</strong></td>`;
          return `<td>${str.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
        }).join('')}</tr>`;
      }).join('');
    }

    updateStats();
  }

  // Table chip switch
  tableChips?.querySelectorAll('.db-table-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      tableChips.querySelectorAll('.db-table-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const table = chip.dataset.table;
      sqlInput.value = `SELECT * FROM ${table} ORDER BY id DESC LIMIT 50;`;
      runCurrentQuery();
    });
  });

  // Presets click
  document.querySelectorAll('.db-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sqlInput.value = btn.dataset.sql;
      runCurrentQuery();
    });
  });

  btnExecute?.addEventListener('click', runCurrentQuery);
  btnRefresh?.addEventListener('click', runCurrentQuery);

  sqlInput?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCurrentQuery();
    }
  });

  btnReset?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset the SQLite database back to original seed data?')) {
      await resetDatabaseToSeed();
      sqlInput.value = 'SELECT * FROM users;';
      runCurrentQuery();
      updateStats();
    }
  });

  btnExport?.addEventListener('click', () => {
    downloadDatabaseFile('blendify.sqlite');
  });

  btnClose?.addEventListener('click', closeExplorer);
  btnDismiss?.addEventListener('click', closeExplorer);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeExplorer();
  });

  // Global Keyboard Shortcut: Ctrl + Shift + D to open
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (modal.classList.contains('open')) {
        closeExplorer();
      } else {
        openExplorer();
      }
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeExplorer();
    }
  });

  // Attach to trigger buttons
  document.querySelectorAll('#btnOpenDbExplorer, .btn-open-db-explorer').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openExplorer();
    });
  });

  return { openExplorer, closeExplorer };
}
