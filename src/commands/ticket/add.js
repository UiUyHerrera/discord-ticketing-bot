'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const { resolveTicketContext, requireStaff } = require('../../utils/ticketGuard');
const ticketService = require('../../services/ticketService');
const logService = require('../../services/logService');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const { pick } = require('../../services/ticketTheme');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('Add a user to the current ticket (staff).')
    .addUserOption((opt) => opt.setName('user').setDescription('User to add').setRequired(true)),
  async execute(interaction) {
    const ctx = await resolveTicketContext(interaction);
    if (!ctx) return;
    const { ticket, guildConfig } = ctx;

    if (!(await requireStaff(interaction, guildConfig))) return;

    const user = interaction.options.getUser('user', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({ embeds: [errorEmbed('That user was not found in the server.')], ephemeral: true });
      return;
    }

    try {
      await interaction.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true,
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed('I could not grant access to the channel. Check my permissions.')], ephemeral: true });
      return;
    }

    ticketService.addTicketMember(ticket.id, user.id, interaction.member.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          pick(ticket.language, `<@${user.id}> was added to the ticket.`, `<@${user.id}> fue agregado al ticket.`),
          pick(ticket.language, 'User added', 'Usuario agregado')
        ),
      ],
    });

    await logService.sendLog(interaction.client, guildConfig, 'user_added', [
      { name: 'Ticket', value: `#${String(ticket.number).padStart(4, '0')}`, inline: true },
      { name: 'User', value: `<@${user.id}>`, inline: true },
      { name: 'Added by', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
