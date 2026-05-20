/**
 * data.js — Static configuration data for FlowMind
 * Region payment systems, chart config, account seeds
 */

'use strict';

const FlowData = (() => {

  // ─── Region payment systems ─────────────────────────────────────────────

  const REGION_DATA = {
    europe: {
      flag: '🇪🇺',
      name: 'Европа',
      desc: 'Основная система платежей на территории ЕС',
      systems: [
        { name: 'SEPA',    icon: '🏦', desc: 'Single Euro Payments Area',      status: 'available', info: 'Стандарт для платежей в евро' },
        { name: 'SWIFT',   icon: '🌐', desc: 'Society for Worldwide Interbank', status: 'available', info: 'Международные переводы' },
        { name: 'Target2', icon: '⚡', desc: 'Real-time Gross Settlement',      status: 'available', info: 'Система расчётов ЕЦБ' },
        { name: 'Kartuli', icon: '💳', desc: 'European Card System',            status: 'available', info: 'Межбанковская карточная сеть' },
      ],
    },
    asia: {
      flag: '🌏',
      name: 'Азия',
      desc: 'Платежные системы Азиатско-Тихоокеанского региона',
      systems: [
        { name: 'SWIFT',    icon: '🌐', desc: 'Society for Worldwide Interbank',    status: 'available', info: 'Международные переводы' },
        { name: 'CIPS',     icon: '¥',  desc: 'Cross-border Interbank Payment Sys', status: 'available', info: 'Система расчётов в юанях' },
        { name: 'JPN-RTGS', icon: '🇯🇵', desc: 'Bank of Japan Real-Time System',    status: 'available', info: 'Японская система расчётов' },
        { name: 'NAPAS',    icon: '🏮', desc: 'National Payments Corp Vietnam',     status: 'coming',    info: 'Вскоре будет доступна' },
        { name: 'UnionPay', icon: '💳', desc: 'China UnionPay International',       status: 'available', info: 'Крупнейшая карточная сеть' },
      ],
    },
    americas: {
      flag: '🌎',
      name: 'Америка',
      desc: 'Платежные системы Северной и Южной Америки',
      systems: [
        { name: 'SWIFT',          icon: '🌐', desc: 'Society for Worldwide Interbank', status: 'available', info: 'Международные переводы' },
        { name: 'ACH',            icon: '🇺🇸', desc: 'Automated Clearing House',       status: 'available', info: 'Система расчётов в США' },
        { name: 'Fedwire',        icon: '⚡', desc: 'Federal Reserve Wire Network',    status: 'available', info: 'Быстрые переводы в USD' },
        { name: 'LatAm Express',  icon: '🌴', desc: 'Latin American Payment Hub',      status: 'coming',    info: 'Запуск Q2 2025' },
        { name: 'Visa/Mastercard',icon: '💳', desc: 'Global Card Networks',            status: 'available', info: 'Карточные платежи' },
      ],
    },
    'middle-east': {
      flag: '🌍',
      name: 'Ближний Восток & Африка',
      desc: 'Платежные системы Ближнего Востока и Африки',
      systems: [
        { name: 'SWIFT',          icon: '🌐', desc: 'Society for Worldwide Interbank',   status: 'available', info: 'Международные переводы' },
        { name: 'SSNIP',          icon: '🇸🇦', desc: 'Saudi National Payments Network',  status: 'available', info: 'Система Саудовской Аравии' },
        { name: 'MEPA',           icon: '💰', desc: 'Middle East Payments Alliance',      status: 'available', info: 'Региональная платежная сеть' },
        { name: 'ZimSwitch',      icon: '🌍', desc: 'Zimbabwe National Switch',           status: 'coming',    info: 'Вскоре будет доступна' },
        { name: 'Visa/Mastercard',icon: '💳', desc: 'Global Card Networks',               status: 'available', info: 'Карточные платежи' },
      ],
    },
  };

  // ─── Transaction feed seeds ──────────────────────────────────────────────

  const TX_TYPES = [
    { cls: 'sepa',  icon: 'ti-building-bank', label: 'SEPA',  currencies: ['EUR'] },
    { cls: 'swift', icon: 'ti-world',          label: 'SWIFT', currencies: ['USD', 'GBP', 'JPY'] },
    { cls: 'card',  icon: 'ti-credit-card',    label: 'CARD',  currencies: ['USD', 'EUR', 'GBP'] },
  ];

  const TX_ACTIONS = [
    'Перевод от клиента',
    'Выплата мерчанту',
    'Карточный платёж',
    'Входящий SWIFT',
    'Исходящий SEPA',
    'Межбанковский трансфер',
  ];

  const TX_AMOUNTS = [
    '€12,400', '$8,750', '£3,200', '¥2,100,000',
    '$45,000', '€7,800', '£15,300', '$2,100',
  ];

  // ─── API base URL ────────────────────────────────────────────────────────

  const API_BASE = 'http://localhost:8000';

  return { REGION_DATA, TX_TYPES, TX_ACTIONS, TX_AMOUNTS, API_BASE };
})();
