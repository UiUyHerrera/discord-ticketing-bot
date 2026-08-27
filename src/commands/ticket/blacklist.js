'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const configService = require('../../services/configService');
const { isAdmin } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const logService = require('../../services/logService');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('blacklist')
    .setDescription('Prevent a user from opening tickets (admins).')
    .addUserOption((opt) => opt.setName('user').setDescription('User to blacklist').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason (optional)').setRequired(false).setMaxLength(200)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this command.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason');

    configService.addToBlacklist(interaction.guild.id, user.id, reason, interaction.member.id);

    await interaction.reply({ embeds: [successEmbed(`<@${user.id}> can no longer create tickets.`, 'User blacklisted')], ephemeral: true });

    const guildConfig = configService.getGuildConfig(interaction.guild.id);
    await logService.sendLog(interaction.client, guildConfig, 'blacklist_added', [
      { name: 'User', value: `<@${user.id}>`, inline: true },
      { name: 'Reason', value: reason || 'Not specified', inline: true },
      { name: 'By', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
