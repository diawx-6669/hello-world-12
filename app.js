/**
 * app.js — Main FlowMind application logic
 * Navigation, API polling, registration, optimization
 */

'use strict';

const FlowApp = (() => {

  // ─── API helpers ─────────────────────────────────────────────────────────

  async function _apiFetch(path, options = {}) {
    try {
      const res = await fetch(`${FlowData.API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[FlowApp] API ${path} failed:`, e.message);
      return null;
    }
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  function switchTab(tab, triggerEl) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(tab);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const btn = triggerEl?.closest?.('.nav-item') ?? triggerEl;
    if (btn) btn.classList.add('active');

    const titles = { dashboard: 'Инфраструктура', register: 'Регистрация' };
    const titleEl = document.getElementById('current-section');
    if (titleEl) titleEl.textContent = titles[tab] || 'FlowMind';
  }

  function switchDashboardTab(btn, tab) {
    document.querySelectorAll('#dashboard .tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(tab);
    if (target) target.classList.add('active');

    document.querySelectorAll('.tab-container .tab-btn').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
  }

  function switchChart(btn) {
    document.querySelectorAll('.tab-group .tab').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
  }

  // ─── Live metrics polling ─────────────────────────────────────────────────

  async function _pollMetrics() {
    const data = await _apiFetch('/api/dashboard');
    if (!data) return;

    const tpsEl = document.getElementById('tps');
    if (tpsEl) FlowUI.updateMetricEl(tpsEl, data.tps.toLocaleString('ru-RU'));
  }

  async function _pollHealth() {
    const data = await _apiFetch('/api/dashboard/health');
    if (!data) return;

    const scoreEl = document.getElementById('health-score');
    if (scoreEl) FlowUI.updateMetricEl(scoreEl, data.overall + '%');
  }

  async function _pollAlerts() {
    const data = await _apiFetch('/api/alerts');
    if (!data) return;

    const container = document.getElementById('alerts-container');
    if (!container) return;

    container.innerHTML = '';
    data.alerts.forEach(alert => {
      container.appendChild(FlowUI.renderAlertItem(alert));
    });
  }

  async function acknowledgeAlert(alertId) {
    const data = await _apiFetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
    if (data?.success) {
      const item = document.querySelector(`[data-alert-id="${alertId}"]`);
      if (item) {
        item.style.transition = 'opacity 0.3s';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
      }
      FlowUI.showToast('Алерт закрыт');
    } else {
      FlowUI.showToast('Ошибка при закрытии алерта', 'error');
    }
  }

  // ─── Registration ─────────────────────────────────────────────────────────

  async function registerUser() {
    const fullname = document.getElementById('fullname')?.value?.trim();
    const email    = document.getElementById('email')?.value?.trim();
    const company  = document.getElementById('company')?.value?.trim();
    const region   = document.getElementById('region')?.value;

    if (!fullname || !email || !company || !region) {
      FlowUI.showToast('Пожалуйста, заполните все поля', 'error');
      return;
    }

    // Try API first
    const apiResult = await _apiFetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ fullname, email, company, region }),
    });

    if (apiResult?.id) {
      _onRegistered({ fullname, email, company, region });
    } else if (apiResult === null) {
      // API unavailable — fallback to local storage
      _onRegistered({ fullname, email, company, region });
    } else {
      FlowUI.showToast(apiResult?.detail || 'Ошибка регистрации', 'error');
      return;
    }

    localStorage.setItem('flowmind_user', JSON.stringify({ fullname, email, company, region }));
  }

  function _onRegistered(user) {
    document.getElementById('register-form')?.style && (document.getElementById('register-form').style.display = 'none');

    const successMsg = document.getElementById('success-msg');
    if (successMsg) { successMsg.classList.add('show'); }

    const userInfo = document.getElementById('user-info');
    if (userInfo) userInfo.classList.add('show');

    const nameEl   = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    const regionEl = document.getElementById('user-region');
    const regionData = FlowData.REGION_DATA[user.region];

    if (nameEl)   nameEl.textContent   = user.fullname;
    if (avatarEl) avatarEl.textContent = user.fullname.charAt(0).toUpperCase();
    if (regionEl) regionEl.textContent = regionData?.name || user.region;

    _displayRegionInfo(user.region);

    setTimeout(() => successMsg?.classList.remove('show'), 4000);
  }

  function _displayRegionInfo(region) {
    const regInfo = document.getElementById('region-info');
    if (regInfo) regInfo.classList.add('show');

    FlowUI.renderRegionSystems(
      region,
      document.getElementById('systems-grid'),
      document.getElementById('region-flag'),
      document.getElementById('region-name'),
      document.getElementById('region-desc'),
    );
  }

  function updateSystems() {
    const region = document.getElementById('region')?.value;
    if (region) _displayRegionInfo(region);
  }

  function logout() {
    localStorage.removeItem('flowmind_user');
    const form = document.getElementById('register-form');
    if (form) form.style.display = 'block';
    ['user-info', 'region-info', 'success-msg'].forEach(id => {
      document.getElementById(id)?.classList.remove('show');
    });
    ['fullname', 'email', 'company'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const regionEl = document.getElementById('region');
    if (regionEl) regionEl.value = '';
  }

  // ─── Optimization scenario ────────────────────────────────────────────────

  async function runScenario(scenario) {
    FlowUI.showToast(`Запускаю сценарий: ${scenario}…`);
    const data = await _apiFetch('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
    if (!data) {
      FlowUI.showToast('API недоступен. Результат будет показан офлайн.', 'error');
      return;
    }
    FlowUI.showToast(`✓ Рекомендация (оценка ${data.impact_score}/10): ${data.recommendation}`);
  }

  // ─── Clock ────────────────────────────────────────────────────────────────

  function _updateClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }) + ' UTC+3';
  }

  // ─── TPS counter (offline fallback) ──────────────────────────────────────

  let _tps = 12847;
  function _tickTps() {
    _tps += Math.round((Math.random() - 0.45) * 200);
    if (_tps < 10_000) _tps = 10_000;
    const el = document.getElementById('tps');
    if (el && el.dataset.apiMode !== 'true') {
      el.textContent = _tps.toLocaleString('ru-RU');
    }
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────

  function init() {
    // Clock
    _updateClock();
    setInterval(_updateClock, 1000);

    // Pulse feed
    const feed    = document.getElementById('pulse-feed');
    const feedCnt = document.getElementById('feed-count');
    if (feed) {
      for (let i = 0; i < 5; i++) FlowUI.renderTransaction(feed, feedCnt);
      setInterval(() => FlowUI.renderTransaction(feed, feedCnt), 2200);
    }

    // API polling (every 5 s)
    _pollMetrics();
    _pollHealth();
    _pollAlerts();
    setInterval(_pollMetrics, 5000);
    setInterval(_pollHealth, 10000);
    setInterval(_pollAlerts, 15000);

    // Offline TPS fallback (fires when API is down)
    setInterval(_tickTps, 1800);

    // Tab chart buttons
    document.querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Search init
    const searchInput = document.getElementById('search-input');
    if (searchInput) FlowSearch.init(searchInput);

    // Restore session
    try {
      const saved = localStorage.getItem('flowmind_user');
      if (saved) {
        const user = JSON.parse(saved);
        _onRegistered(user);
      }
    } catch { /* ignore */ }
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    init,
    switchTab,
    switchDashboardTab,
    switchChart,
    registerUser,
    updateSystems,
    logout,
    acknowledgeAlert,
    runScenario,
  };
})();

// Boot on DOMContentLoaded
document.addEventListener('DOMContentLoaded', FlowApp.init);
