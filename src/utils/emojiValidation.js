'use strict';

const CUSTOM_EMOJI_RE = /^<a?:\w{2,32}:\d{15,25}>$/;

function looksLikeUnresolvedEmojiCode(value) {
  if (!value) return false;
  if (CUSTOM_EMOJI_RE.test(value)) return false;
  return value.startsWith('\\') || value.startsWith(':') || value.endsWith(':');
}

module.exports = { CUSTOM_EMOJI_RE, looksLikeUnresolvedEmojiCode };
