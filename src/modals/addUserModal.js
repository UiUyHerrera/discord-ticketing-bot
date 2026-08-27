'use strict';

const { build } = require('../utils/ids');
const { resolveTicketContext, requireStaff } = require('../utils/ticketGuard');
const { extractUserId } = require('../utils/parseUser');
const ticketService = require('../services/ticketService');
const logService = require('../services/logService');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { pick } = require('../services/ticketTheme');

module.exports = {
  customId: build('ticket', 'addusermodal'),
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

    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) {
      await interaction.reply({ embeds: [errorEmbed('That user was not found in the server.')], ephemeral: true });
      return;
    }

    try {
      await interaction.channel.permissionOverwrites.edit(userId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true,
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('I could not grant access to the channel. Check my permissions.')], ephemeral: true });
      return;
    }

    ticketService.addTicketMember(ticket.id, userId, interaction.member.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${userId}> was added to the ticket.`, `<@${userId}> fue agregado al ticket.`),
          pick(ticket.language, 'User added', 'Usuario agregado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'user_added', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'User', value: `<@${userId}>`, inline: true },
      { name: 'Added by', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
