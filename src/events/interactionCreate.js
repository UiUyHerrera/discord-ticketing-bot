'use strict';

const { Events, MessageFlags } = require('discord.js');
const logger = require('../utils/logger');
const config = require('../config');
const { errorEmbed } = require('../utils/embeds');

const TTL_MS = config.ephemeralTtlSeconds * 1000;
const pending = new Map();

async function replyError(interaction, message) {
  const payload = { embeds: [errorEmbed(message)], components: [], ephemeral: true };
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (err) {
    logger.warn('No se pudo enviar el mensaje de error al usuario:', err.message);
  }
}

function isEphemeral(interaction) {
  if (interaction.ephemeral === true) return true;
  const flags = interaction.message && interaction.message.flags;
  return Boolean(flags && flags.has(MessageFlags.Ephemeral));
}

async function scheduleCleanup(interaction) {
  if (!TTL_MS || !isEphemeral(interaction)) return;

  const messageId = interaction.message
    ? interaction.message.id
    : await interaction.fetchReply().then((m) => m.id).catch(() => null);
  if (!messageId) return;

  const existing = pending.get(messageId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    pending.delete(messageId);
    interaction.deleteReply().catch(() => {});
  }, TTL_MS);
  timer.unref();
  pending.set(messageId, timer);
}

async function dispatch(interaction, client) {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`Comando desconocido recibido: ${interaction.commandName}`);
      return replyError(interaction, 'This command is no longer available.');
    }
    return command.execute(interaction, client);
  }

  if (interaction.isButton()) {
    const handler = client.buttons.get(interaction.customId);
    if (!handler) {
      logger.warn(`Botón sin handler: ${interaction.customId}`);
      return replyError(interaction, 'This button is no longer valid. The bot may have been updated.');
    }
    return handler.execute(interaction, client);
  }

  if (interaction.isAnySelectMenu?.() || interaction.isStringSelectMenu() || interaction.isChannelSelectMenu?.() || interaction.isRoleSelectMenu?.()) {
    const handler = client.menus.get(interaction.customId);
    if (!handler) {
      logger.warn(`Menú sin handler: ${interaction.customId}`);
      return replyError(interaction, 'This menu is no longer valid.');
    }
    return handler.execute(interaction, client);
  }

  if (interaction.isModalSubmit()) {
    const handler = client.modals.get(interaction.customId);
    if (!handler) {
      logger.warn(`Modal sin handler: ${interaction.customId}`);
      return replyError(interaction, 'This form is no longer valid.');
    }
    return handler.execute(interaction, client);
  }

  return undefined;
}

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    try {
      await dispatch(interaction, client);
    } catch (err) {
      logger.error(`Error manejando interacción (${interaction.type}):`, err);
      await replyError(interaction, 'An unexpected error occurred while processing your request. Please try again.');
    }

    await scheduleCleanup(interaction);
  },
};
