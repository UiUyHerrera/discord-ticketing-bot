'use strict';

const liveTheme = require('./liveTheme');
const themeEs = require('../theme.es');

const SPANISH = {
  colors: liveTheme.colors,
  embeds: themeEs.embeds,
  common: themeEs.common,
  status: themeEs.status,
  ticket: themeEs.ticket,
  userModals: themeEs.userModals,
  userInfo: themeEs.userInfo,
  renderTemplate: liveTheme.renderTemplate,
};

function getTicketTheme(language) {
  return language === 'es' ? SPANISH : liveTheme;
}

function pick(language, en, es) {
  return language === 'es' ? es : en;
}

function resolveCategory(category, language) {
  const translated = getTicketTheme(language).ticket.categories[category.key];
  return {
    label: (translated && translated.label) || category.label,
    description: (translated && translated.description) || category.description,
  };
}

module.exports = { getTicketTheme, pick, resolveCategory };
