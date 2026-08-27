'use strict';

const { SlashCommandSubcommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const configService = require('../../services/configService');
const { isAdmin } = require('../../utils/permissions');
const { errorEmbed, successEmbed } = require('../../utils/embeds');
const { buildPanelEmbed, buildPanelButtonRow } = require('../../services/ticketView');

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName('panel')
    .setDescription('Publish (or republish) the ticket creation panel.')
    .addStringOption((opt) =>
      opt
        .setName('language')
        .setDescription('Language for this panel and the tickets it creates')
        .setRequired(true)
        .addChoices({ name: 'English', value: 'en' }, { name: 'Spanish', value: 'es' })
    )
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Channel to send the panel to (defaults to the one set in /ticket setup)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({ embeds: [errorEmbed('You need the "Manage Server" permission to use this command.')], ephemeral: true });
      return;
    }

    const language = interaction.options.getString('language', true);
    const guildConfig = configService.getGuildConfig(interaction.guild.id);
    const targetChannel = interaction.options.getChannel('channel') || (guildConfig.panel_channel_id ? await interaction.guild.channels.fetch(guildConfig.panel_channel_id).catch(() => null) : null);

    if (!targetChannel) {
      await interaction.reply({
        embeds: [errorEmbed('No channel is configured. Specify one with the `channel` option or set it via `/ticket setup`.')],
        ephemeral: true,
      });
      return;
    }

    const me = interaction.guild.members.me;
    if (!targetChannel.permissionsFor(me).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
      await interaction.reply({ embeds: [errorEmbed(`I do not have permission to send messages in ${targetChannel}.`)], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const message = await targetChannel.send({
      embeds: [buildPanelEmbed(guildConfig, language)],
      components: [buildPanelButtonRow(language)],
    });

    configService.updateGuildConfig(interaction.guild.id, {
      panel_channel_id: targetChannel.id,
      panel_message_id: message.id,
    });

    await interaction.editReply({ embeds: [successEmbed(`Panel published in ${targetChannel}.`, 'Panel published')] });
  },
};
