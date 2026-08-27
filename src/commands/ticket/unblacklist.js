'use strict';

const { SlashCommandSubcommandBuilder } = require('discord.js');
const configService = require('../../services/configService');
const { isAdmin } = require('../../utils/permissions');
const { successEmbed, errorEmbed } = require('../../utils/embeds');
const logService = require('../../services/logService');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('unblacklist')
    .setDescription('Allow a user to open tickets again (admins).')
    .addUserOption((opt) => opt.setName('user').setDescription('User to unblacklist').setRequired(true)),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this command.')], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('user', true);
    const removed = configService.removeFromBlacklist(interaction.guild.id, user.id);

    if (!removed) {
      await interaction.reply({ embeds: [errorEmbed(`<@${user.id}> was not on the blacklist.`)], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [successEmbed(`<@${user.id}> can create tickets again.`, 'User removed from blacklist')], ephemeral: true });

    const guildConfig = configService.getGuildConfig(interaction.guild.id);
    await logService.sendLog(interaction.client, guildConfig, 'blacklist_removed', [
      { name: 'User', value: `<@${user.id}>`, inline: true },
      { name: 'By', value: `<@${interaction.member.id}>`, inline: true },
    ]);
  },
};
