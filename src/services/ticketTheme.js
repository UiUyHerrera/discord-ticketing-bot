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

module.exports = { getTicketTheme, pick };
