'use strict';

const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff } = require('../utils/ticketGuard');
const { extractUserId } = require('../utils/parseUser');
const ticketService = require('../services/ticketService');
const logService = require('../services/logService');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { pick } = require('../services/ticketTheme');

module.exports = {
  customId: build('ticket', 'removeusermodal'),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    const raw = interaction.fields.getTextInputValue('userId');
    const userId = extractUserId(raw);
    if (!userId) {
      await interaction.reply({ embeds: [errorEmbed('The ID or mention provided is not valid.')], ephemeral: true });
      return;
    }

    if (userId === ticket.user_id) {
      await interaction.reply({
        embeds: [errorEmbed('You cannot remove the ticket creator. Use "Close Ticket" instead.')],
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.channel.permissionOverwrites.delete(userId);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('I could not remove their access to the channel. Check my permissions.')], ephemeral: true });
      return;
    }

    ticketService.removeTicketMember(ticket.id, userId);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${userId}> was removed from the ticket.`, `<@${userId}> fue quitado del ticket.`),
          pick(ticket.language, 'User removed', 'Usuario quitado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'user_removed', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'User', value: `<@${userId}>`, inline: true },
      { name: 'Removed by', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
