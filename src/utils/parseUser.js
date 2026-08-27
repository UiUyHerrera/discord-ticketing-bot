'use strict';

function extractUserId(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  const mentionMatch = trimmed.match(/^<@!?(\d{17,20})>$/);
  if (mentionMatch) return mentionMatch[1];
  if (/^\d{17,20}$/.test(trimmed)) return trimmed;
  return null;
}

module.exports = { extractUserId };
