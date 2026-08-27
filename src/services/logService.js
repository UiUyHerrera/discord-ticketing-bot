'use strict';

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const logger = require('../utils/logger');
const theme = require('./liveTheme');

const EVENT_STYLES = theme.logs;

async function sendLog(client, guildConfig, eventKey, fields = [], filePath = null) {
  if (!guildConfig || !guildConfig.logs_channel_id) return;

  try {
    const channel = await client.channels.fetch(guildConfig.logs_channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const style = EVENT_STYLES[eventKey] || { title: eventKey, color: '#5865F2' };
    const embed = new EmbedBuilder().setTitle(style.title).setColor(style.color).setTimestamp();

    if (fields.length) embed.addFields(fields);

    const payload = { embeds: [embed] };
    if (filePath) {
      payload.files = [new AttachmentBuilder(filePath)];
    }

    await channel.send(payload);
  } catch (err) {
    logger.error(`No se pudo enviar el log "${eventKey}":`, err.message);
  }
}

module.exports = { sendLog };
