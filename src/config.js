'use strict';

const theme = require('./services/liveTheme');

module.exports = {
  get defaultColor() {
    return theme.colors.default;
  },

  colors: theme.colors,

  defaultCategories: [
    { key: 'compra', label: 'Buy', emoji: null, description: 'I want to buy something.' },
    { key: 'venta', label: 'Sell', emoji: null, description: 'I want to sell something.' },
    { key: 'pago', label: 'Payment / Withdrawal', emoji: null, description: 'Manage a payment or withdrawal.' },
    { key: 'soporte', label: 'Support', emoji: null, description: 'I need help or support.' },
    { key: 'negocio', label: 'Business', emoji: null, description: 'Business proposal.' },
    { key: 'reporte', label: 'Report', emoji: null, description: 'Report a problem or user.' },
  ],

  defaultCooldownSeconds: 30,

  ephemeralTtlSeconds: 300,

  defaultTicketName: 'ticket',

  ticketNumberPadding: 4,

  transcriptsDir: require('node:path').join(__dirname, '..', 'transcripts'),
};
