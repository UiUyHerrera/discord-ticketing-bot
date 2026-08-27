'use strict';

const { build, parse } = require('../utils/ids');
const configService = require('../services/configService');
const ticketService = require('../services/ticketService');
const { errorEmbed, infoEmbed } = require('../utils/embeds');
const { buildCategorySelectRow, buildGoToTicketRow } = require('../services/ticketView');
const { pick } = require('../services/ticketTheme');

module.exports = {
  customIds: [build('ticket', 'create', 'en'), build('ticket', 'create', 'es')],
  async execute(interaction) {
    const { guild, member } = interaction;
    const { args } = parse(interaction.customId);
    const language = args[0] === 'es' ? 'es' : 'en';
    const guildConfig = configService.getGuildConfig(guild.id);

    if (configService.isBlacklisted(guild.id, member.id)) {
      await interaction.reply({
        embeds: [errorEmbed(pick(language, 'You do not have permission to create tickets.', 'No tenés permiso para crear tickets.'))],
        ephemeral: true,
      });
      return;
    }

    const existing = ticketService.getOpenTicketForUser(guild.id, member.id);
    if (existing) {
      const channel = await guild.channels.fetch(existing.channel_id).catch(() => null);
      if (channel) {
        await interaction.reply({
          embeds: [
            errorEmbed(
              pick(language, 'You cannot create another ticket because you already have one open.', 'No podés crear otro ticket porque ya tenés uno abierto.'),
              pick(language, 'You already have a ticket', 'Ya tenés un ticket')
            ),
          ],
          components: [buildGoToTicketRow(guild.id, channel.id, existing.language)],
          ephemeral: true,
        });
        return;
      }
      ticketService.closeTicket(existing.id, interaction.client.user.id);
    }

    const remaining = configService.getRemainingCooldown(guild.id, member.id);
    if (remaining > 0) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            pick(language, `You must wait ${remaining} second(s) before opening another ticket.`, `Debés esperar ${remaining} segundo(s) antes de poder abrir otro ticket.`),
            pick(language, 'Cooldown active', 'Cooldown activo')
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const categories = configService.listCategories(guild.id);
    if (categories.length === 0) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            pick(
              language,
              'The staff has not configured ticket categories yet. Use `/ticket config` to add them.',
              'El staff todavía no configuró categorías de ticket. Usa `/ticket config` para agregarlas.'
            )
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [infoEmbed(pick(language, 'Select the reason for your ticket from the menu below.', 'Selecciona el motivo de tu ticket en el menú de abajo.'), pick(language, 'Create Ticket', 'Crear Ticket'))],
      components: [buildCategorySelectRow(categories, language)],
      ephemeral: true,
    });
  },
};
