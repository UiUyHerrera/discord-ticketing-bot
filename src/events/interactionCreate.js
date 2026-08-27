'use strict';

const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { errorEmbed } = require('../utils/embeds');

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

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          logger.warn(`Comando desconocido recibido: ${interaction.commandName}`);
          return replyError(interaction, 'This command is no longer available.');
        }
        await command.execute(interaction, client);
        return;
      }

      if (interaction.isButton()) {
        const handler = client.buttons.get(interaction.customId);
        if (!handler) {
          logger.warn(`Botón sin handler: ${interaction.customId}`);
          return replyError(interaction, 'This button is no longer valid. The bot may have been updated.');
        }
        await handler.execute(interaction, client);
        return;
      }

      if (interaction.isAnySelectMenu?.() || interaction.isStringSelectMenu() || interaction.isChannelSelectMenu?.() || interaction.isRoleSelectMenu?.()) {
        const handler = client.menus.get(interaction.customId);
        if (!handler) {
          logger.warn(`Menú sin handler: ${interaction.customId}`);
          return replyError(interaction, 'This menu is no longer valid.');
        }
        await handler.execute(interaction, client);
        return;
      }

      if (interaction.isModalSubmit()) {
        const handler = client.modals.get(interaction.customId);
        if (!handler) {
          logger.warn(`Modal sin handler: ${interaction.customId}`);
          return replyError(interaction, 'This form is no longer valid.');
        }
        await handler.execute(interaction, client);
        return;
      }
    } catch (err) {
      logger.error(`Error manejando interacción (${interaction.type}):`, err);
      await replyError(interaction, 'An unexpected error occurred while processing your request. Please try again.');
    }
  },
};
