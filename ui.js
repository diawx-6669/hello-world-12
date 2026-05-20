/**
 * ui.js — UI rendering helpers for FlowMind
 * Renders pulse feed, region payment system cards, metric badges
 */

'use strict';

const FlowUI = (() => {

  // ─── Pulse feed ──────────────────────────────────────────────────────────

  let _totalTx = 4_382_190;

  function renderTransaction(container, countEl) {
    _totalTx += Math.round(Math.random() * 15 + 5);
    if (countEl) countEl.textContent = _totalTx.toLocaleString('ru-RU') + ' сегодня';

    const t = FlowData.TX_TYPES[Math.floor(Math.random() * FlowData.TX_TYPES.length)];
    const amount = FlowData.TX_AMOUNTS[Math.floor(Math.random() * FlowData.TX_AMOUNTS.length)];
    const action = FlowData.TX_ACTIONS[Math.floor(Math.random() * FlowData.TX_ACTIONS.length)];
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const amountColor = t.cls === 'sepa' ? 'var(--blue)' : t.cls === 'swift' ? 'var(--green)' : 'var(--amber)';

    const item = document.createElement('div');
    item.className = 'pulse-item';
    item.innerHTML = `
      <div class="pulse-icon ${t.cls}"><i class="ti ${t.icon}" aria-hidden="true"></i></div>
      <div class="pulse-text">
        <div class="pulse-desc">${action}</div>
        <div class="pulse-time">${t.label} · ${time}</div>
      </div>
      <div class="pulse-amount" style="color:${amountColor}">${amount}</div>
    `;

    container.insertBefore(item, container.firstChild);
    while (container.children.length > 5) container.removeChild(container.lastChild);
  }

  // ─── Region systems grid ─────────────────────────────────────────────────

  function renderRegionSystems(region, gridEl, flagEl, nameEl, descEl) {
    const data = FlowData.REGION_DATA[region];
    if (!data) return;

    if (flagEl) flagEl.textContent = data.flag;
    if (nameEl) nameEl.textContent = data.name;
    if (descEl) descEl.textContent = data.desc;

    if (!gridEl) return;
    gridEl.innerHTML = '';

    data.systems.forEach(sys => {
      const card = document.createElement('div');
      card.className = `system-card ${sys.status === 'available' ? 'available' : 'unavailable'}`;
      const statusLabel =
        sys.status === 'available' ? '✓ Доступна' :
        sys.status === 'coming'    ? '⏳ Вскоре'  : '❌ Недоступна';
      card.innerHTML = `
        <div class="system-icon">${sys.icon}</div>
        <div class="system-name">${sys.name}</div>
        <div class="system-desc">${sys.desc}</div>
        <div class="system-status status-${sys.status}">${statusLabel}</div>
        <div style="font-size:9px;color:var(--muted);margin-top:8px">${sys.info}</div>
      `;
      gridEl.appendChild(card);
    });
  }

  // ─── Metric value update with flash animation ────────────────────────────

  function updateMetricEl(el, newValue) {
    if (!el) return;
    el.textContent = newValue;
    el.style.transition = 'color 0.3s';
    el.style.color = 'var(--green)';
    setTimeout(() => { el.style.color = ''; }, 600);
  }

  // ─── Alert badge helpers ─────────────────────────────────────────────────

  function severityClass(severity) {
    return { critical: 'red', warning: 'amber', info: 'green' }[severity] || 'amber';
  }

  function renderAlertItem(alert) {
    const cls = severityClass(alert.severity);
    const badgeLabel = { critical: 'КРИТИЧНО', warning: 'ВНИМАНИЕ', info: 'ИНФО' }[alert.severity] || alert.severity;
    const div = document.createElement('div');
    div.className = 'alert-item';
    div.dataset.alertId = alert.id;
    div.innerHTML = `
      <div class="alert-dot ${cls}"></div>
      <div style="flex:1">
        <div class="alert-text">${alert.message}</div>
        <div class="alert-meta">${alert.source}</div>
        <span class="alert-badge badge-${cls}">${badgeLabel}</span>
      </div>
      <button class="ack-btn" onclick="FlowApp.acknowledgeAlert('${alert.id}')" title="Закрыть"
        style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:2px 4px">✕</button>
    `;
    return div;
  }

  // ─── Success / error flash toast ────────────────────────────────────────

  function showToast(message, type = 'success') {
    const existing = document.getElementById('fm-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'fm-toast';
    const bg = type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)';
    const border = type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)';
    const color = type === 'success' ? 'var(--green)' : 'var(--red)';
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;
      background:${bg};border:1px solid ${border};color:${color};
      padding:12px 20px;border-radius:8px;font-size:12px;font-family:var(--font);
      z-index:9999;animation:slideIn 0.25s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ─── Expose ──────────────────────────────────────────────────────────────

  return { renderTransaction, renderRegionSystems, updateMetricEl, renderAlertItem, showToast };
})();
