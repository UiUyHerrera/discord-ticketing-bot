'use strict';

function formatDate(input) {
  const d = input instanceof Date ? input : new Date(input.includes(' ') ? input.replace(' ', 'T') + 'Z' : input);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function discordTimestamp(sqliteDate, style = 'R') {
  if (!sqliteDate) return 'Unknown';
  const iso = sqliteDate.includes('T') ? sqliteDate : sqliteDate.replace(' ', 'T') + 'Z';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return `<t:${Math.floor(d.getTime() / 1000)}:${style}>`;
}

function nowSqlite() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { formatDate, discordTimestamp, nowSqlite };
