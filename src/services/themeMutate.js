'use strict';

const { looksLikeUnresolvedEmojiCode } = require('../utils/emojiValidation');
const theme = require('./liveTheme');

const HEX_COLOR_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeColor(value) {
  const v = value.startsWith('#') ? value : `#${value}`;
  return v.toUpperCase();
}

function formatCustomEmojiTag(guildEmoji) {
  return `<${guildEmoji.animated ? 'a' : ''}:${guildEmoji.name}:${guildEmoji.id}>`;
}

function applyText(item, category, rawValue) {
  const value = String(rawValue ?? '').trim();
  if (!value) return { ok: false, error: 'The text cannot be empty.' };
  if (category.key === 'colors') {
    if (!HEX_COLOR_RE.test(value)) return { ok: false, error: 'The color must be a valid hex code, e.g. #808080.' };
    theme.setOverride(item.path, normalizeColor(value));
  } else {
    theme.setOverride(item.path, value);
  }
  return { ok: true };
}

function applyTitleColor(item, rawTitle, rawColor) {
  const title = String(rawTitle ?? '').trim();
  if (!title) return { ok: false, error: 'The text cannot be empty.' };
  const rawC = String(rawColor ?? '').trim();
  if (!HEX_COLOR_RE.test(rawC)) return { ok: false, error: 'The color must be a valid hex code, e.g. #808080.' };
  theme.setOverride(item.titlePath, title);
  theme.setOverride(item.colorPath, normalizeColor(rawC));
  return { ok: true };
}

function applyButtonLabel(item, rawLabel) {
  const label = String(rawLabel ?? '').trim();
  if (!label) return { ok: false, error: 'The button text cannot be empty.' };
  theme.setOverride(item.labelPath, label);
  return { ok: true };
}

function applyButtonEmoji(item, rawEmoji) {
  const emoji = String(rawEmoji ?? '').trim();
  if (looksLikeUnresolvedEmojiCode(emoji)) {
    return {
      ok: false,
      error: `"${emoji}" is not a valid emoji — it looks like you pasted what you typed, not the result.`,
    };
  }
  theme.setOverride(item.emojiPath, emoji);
  return { ok: true };
}

module.exports = { HEX_COLOR_RE, normalizeColor, formatCustomEmojiTag, applyText, applyTitleColor, applyButtonLabel, applyButtonEmoji };
