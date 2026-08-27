'use strict';

const db = require('../database/db');
const themeDefaults = require('../theme');
const fieldsRegistry = require('./themeFields');

const DATA_KEYS = ['colors', 'embeds', 'common', 'status', 'setup', 'ticket', 'userModals', 'stats', 'userInfo', 'logs'];

const current = {};
for (const key of DATA_KEYS) {
  current[key] = structuredClone(themeDefaults[key]);
}
current.renderTemplate = themeDefaults.renderTemplate;

const selectAll = db.prepare('SELECT key, value FROM theme_overrides');
const upsertStmt = db.prepare(`
  INSERT INTO theme_overrides (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);
const deleteStmt = db.prepare('DELETE FROM theme_overrides WHERE key = ?');

for (const row of selectAll.all()) {
  fieldsRegistry.setPath(current, row.key, row.value);
}

function setOverride(path, value) {
  upsertStmt.run(path, value);
  fieldsRegistry.setPath(current, path, value);
}

function resetPaths(paths) {
  const tx = db.transaction((keys) => {
    for (const k of keys) deleteStmt.run(k);
  });
  tx(paths);
  for (const p of paths) {
    fieldsRegistry.setPath(current, p, fieldsRegistry.getPath(themeDefaults, p));
  }
}

function resetAll() {
  resetPaths(fieldsRegistry.allLeafPaths());
}

function getDefault(path) {
  return fieldsRegistry.getPath(themeDefaults, path);
}

current.setOverride = setOverride;
current.resetPaths = resetPaths;
current.resetAll = resetAll;
current.getDefault = getDefault;

module.exports = current;
