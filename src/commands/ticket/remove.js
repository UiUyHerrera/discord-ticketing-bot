'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff } = require('../../utils/ticketGuard');
const ticketService = require('../../services/ticketService');
const logService = require('../../services/logService');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { pick } = require('../../services/ticketTheme');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Remove a user from the current ticket (staff).')
    .addUserOption((opt) => opt.setName('user').setDescription('User to remove').setRequired(true)),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    const user = interaction.options.getUser('user', true);

    if (user.id === ticket.user_id) {
      await interaction.reply({ embeds: [errorEmbed('You cannot remove the ticket creator. Use `/ticket close` instead.')], ephemeral: true });
      return;
    }

    try {
      await interaction.channel.permissionOverwrites.delete(user.id);
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('I could not remove their access to the channel. Check my permissions.')], ephemeral: true });
      return;
    }

    ticketService.removeTicketMember(ticket.id, user.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${user.id}> was removed from the ticket.`, `<@${user.id}> fue quitado del ticket.`),
          pick(ticket.language, 'User removed', 'Usuario quitado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'user_removed', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'User', value: `<@${user.id}>`, inline: true },
      { name: 'Removed by', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
