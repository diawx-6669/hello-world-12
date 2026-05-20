/**
 * search.js — Global search with API integration
 * Falls back to local data search when API is unavailable
 */

'use strict';

const FlowSearch = (() => {

  let _debounceTimer = null;
  let _dropdown = null;

  // ─── Bootstrap: attach to search input ───────────────────────────────────

  function init(inputEl) {
    if (!inputEl) return;

    _dropdown = document.createElement('div');
    _dropdown.id = 'search-dropdown';
    _dropdown.style.cssText = `
      position:absolute;top:calc(100% + 6px);left:0;right:0;
      background:var(--bg2);border:1px solid var(--border2);border-radius:10px;
      box-shadow:var(--shadow-lg);z-index:1000;display:none;
      max-height:320px;overflow-y:auto;
    `;
    inputEl.parentElement.style.position = 'relative';
    inputEl.parentElement.appendChild(_dropdown);

    inputEl.addEventListener('input', (e) => {
      clearTimeout(_debounceTimer);
      const q = e.target.value.trim();
      if (!q || q.length < 2) { _hide(); return; }
      _debounceTimer = setTimeout(() => _doSearch(q), 280);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') _hide();
    });

    document.addEventListener('click', (e) => {
      if (!inputEl.parentElement.contains(e.target)) _hide();
    });
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  async function _doSearch(query) {
    try {
      const res = await fetch(`${FlowData.API_BASE}/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      _renderResults(query, data.results);
    } catch {
      // Fallback: local search
      const results = _localSearch(query);
      _renderResults(query, results);
    }
  }

  function _localSearch(query) {
    const q = query.toLowerCase();
    const results = [];

    // Search accounts
    Object.entries(FlowData.REGION_DATA).forEach(([region, rd]) => {
      rd.systems.forEach(sys => {
        if (sys.name.toLowerCase().includes(q) || sys.desc.toLowerCase().includes(q)) {
          results.push({
            type: 'payment_system',
            id: `ps_${region}_${sys.name}`,
            label: sys.name,
            meta: `${rd.name} · ${sys.status}`,
          });
        }
      });
    });

    return results.slice(0, 10);
  }

  // ─── Render results ───────────────────────────────────────────────────────

  function _renderResults(query, results) {
    _dropdown.innerHTML = '';

    if (!results || results.length === 0) {
      _dropdown.innerHTML = `<div style="padding:14px 16px;font-size:11px;color:var(--muted)">Ничего не найдено по «${query}»</div>`;
      _show();
      return;
    }

    const typeIcons = { account: '🏦', alert: '⚠️', payment_system: '💳' };
    const typeLabels = { account: 'Счёт', alert: 'Алерт', payment_system: 'Платёж. система' };

    // Group by type
    const grouped = {};
    results.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });

    Object.entries(grouped).forEach(([type, items]) => {
      const header = document.createElement('div');
      header.style.cssText = 'padding:8px 14px 4px;font-size:9px;letter-spacing:0.08em;color:var(--muted);text-transform:uppercase;font-family:var(--font)';
      header.textContent = typeLabels[type] || type;
      _dropdown.appendChild(header);

      items.forEach(r => {
        const row = document.createElement('div');
        row.style.cssText = `
          display:flex;align-items:center;gap:10px;padding:9px 14px;
          cursor:pointer;font-size:12px;transition:background 0.12s;
        `;
        row.innerHTML = `
          <span style="font-size:14px">${typeIcons[r.type] || '•'}</span>
          <span style="flex:1;color:var(--text)">${_highlight(r.label, query)}</span>
          ${r.meta ? `<span style="font-size:10px;color:var(--muted);font-family:var(--mono)">${r.meta}</span>` : ''}
        `;
        row.addEventListener('mouseenter', () => { row.style.background = 'var(--bg3)'; });
        row.addEventListener('mouseleave', () => { row.style.background = ''; });
        row.addEventListener('click', () => {
          FlowUI.showToast(`Открываю: ${r.label}`);
          _hide();
        });
        _dropdown.appendChild(row);
      });
    });

    _show();
  }

  function _highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:var(--green-dim);color:var(--green);border-radius:2px;padding:0 2px">$1</mark>');
  }

  function _show() { _dropdown.style.display = 'block'; }
  function _hide() { if (_dropdown) _dropdown.style.display = 'none'; }

  return { init };
})();
