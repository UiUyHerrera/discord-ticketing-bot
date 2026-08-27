'use strict';

const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');
const logger = require('../utils/logger');
const { formatDate } = require('../utils/time');

async function fetchAllMessages(channel) {
  const all = [];
  let lastId;
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;
    all.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }
  return all.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

function buildText({ ticket, userLabel, messages }) {
  const header = `Ticket #${String(ticket.number).padStart(config.ticketNumberPadding, '0')} - ${userLabel}\n${'='.repeat(40)}\n\n`;

  const body = messages
    .filter((m) => !m.author?.bot && m.content)
    .map((m) => `[${formatDate(new Date(m.createdTimestamp))}] ${m.author.tag}: ${m.content}`)
    .join('\n');

  return header + (body || '(No hay mensajes en este ticket.)');
}

async function generateTranscript({ channel, ticket, userLabel }) {
  if (!fs.existsSync(config.transcriptsDir)) {
    fs.mkdirSync(config.transcriptsDir, { recursive: true });
  }

  let messages = [];
  try {
    messages = await fetchAllMessages(channel);
  } catch (err) {
    logger.error('No se pudieron obtener los mensajes para el transcript:', err);
  }

  const text = buildText({ ticket, userLabel, messages });
  const fileName = `ticket-${String(ticket.number).padStart(config.ticketNumberPadding, '0')}.txt`;
  const filePath = path.join(config.transcriptsDir, fileName);
  fs.writeFileSync(filePath, text, 'utf8');

  return { filePath, fileName, messageCount: messages.length };
}

module.exports = { generateTranscript };
