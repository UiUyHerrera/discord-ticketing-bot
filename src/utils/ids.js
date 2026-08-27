'use strict';

const SEP = ':';

function build(...parts) {
  return parts.filter((p) => p !== undefined && p !== null).join(SEP);
}

function parse(customId) {
  const [namespace, action, ...args] = customId.split(SEP);
  return { namespace, action, args };
}

module.exports = { build, parse, SEP };
