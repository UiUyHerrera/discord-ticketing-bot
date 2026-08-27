'use strict';

const { PermissionsBitField } = require('discord.js');
const { build, parse } = require('../utils/ids');
const configService = require('../services/configService');
const ticketService = require('../services/ticketService');
const ticketManager = require('../services/ticketManager');
const { errorEmbed, successEmbed } = require('../utils/embeds');
const { buildGoToTicketRow } = require('../services/ticketView');
const { pick } = require('../services/ticketTheme');
const logger = require('../utils/logger');

module.exports = {
  customIds: [build('ticket', 'categoryselect', 'en'), build('ticket', 'categoryselect', 'es')],
  async execute(interaction) {
    const { guild, member } = interaction;
    const { args } = parse(interaction.customId);
    const language = args[0] === 'es' ? 'es' : 'en';
    await interaction.deferUpdate();

    const guildConfig = configService.getGuildConfig(guild.id);

    if (configService.isBlacklisted(guild.id, member.id)) {
      await interaction.editReply({
        embeds: [errorEmbed(pick(language, 'You do not have permission to create tickets.', 'No tenés permiso para crear tickets.'))],
        components: [],
      });
      return;
    }

    const existing = ticketService.getOpenTicketForUser(guild.id, member.id);
    if (existing) {
      const channel = await guild.channels.fetch(existing.channel_id).catch(() => null);
      if (channel) {
        await interaction.editReply({
          embeds: [
            errorEmbed(
              pick(language, 'You cannot create another ticket because you already have one open.', 'No podés crear otro ticket porque ya tenés uno abierto.'),
              pick(language, 'You already have a ticket', 'Ya tenés un ticket')
            ),
          ],
          components: [buildGoToTicketRow(guild.id, channel.id, existing.language)],
        });
        return;
      }
      ticketService.closeTicket(existing.id, interaction.client.user.id);
    }

    const categoryKey = interaction.values[0];
    const category = configService.getCategory(guild.id, categoryKey);
    if (!category) {
      await interaction.editReply({
        embeds: [errorEmbed(pick(language, 'That category no longer exists. Please try again.', 'Esa categoría ya no existe. Volvé a intentarlo.'))],
        components: [],
      });
      return;
    }

    const me = guild.members.me;
    const requiredPerms = [
      PermissionsBitField.Flags.ManageChannels,
      PermissionsBitField.Flags.ManageRoles,
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
    ];
    if (!me.permissions.has(requiredPerms)) {
      await interaction.editReply({
        embeds: [
          errorEmbed(
            pick(
              language,
              'I do not have the required permissions (Manage Channels / Manage Roles) to create the ticket.',
              'No tengo los permisos necesarios (Gestionar Canales / Gestionar Roles) para crear el ticket.'
            )
          ),
        ],
        components: [],
      });
      return;
    }

    try {
      const { channel } = await ticketManager.createTicketChannel({ guild, member, guildConfig, category, language });
      await interaction.editReply({
        embeds: [successEmbed(pick(language, `Your ticket was created: <#${channel.id}>`, `Tu ticket fue creado: <#${channel.id}>`), pick(language, 'Ticket created', 'Ticket creado'))],
        components: [buildGoToTicketRow(guild.id, channel.id, language)],
      });
    } catch (err) {
      logger.error('Error creando el canal del ticket:', err);
      await interaction.editReply({
        embeds: [
          errorEmbed(
            pick(language, 'An error occurred while creating your ticket. Let the server staff know.', 'Ocurrió un error al crear tu ticket. Avisa al staff del servidor.')
          ),
        ],
        components: [],
      });
    }
  },
};
