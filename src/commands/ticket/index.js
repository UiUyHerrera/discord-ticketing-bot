'use strict';

const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../utils/logger');
const { errorEmbed } = require('../../utils/embeds');

const subcommands = [
  require('./setup'),
  require('./theme'),
  require('./panel'),
  require('./config'),
  require('./close'),
  require('./delete'),
  require('./add'),
  require('./remove'),
  require('./claim'),
  require('./unclaim'),
  require('./lock'),
  require('./unlock'),
  require('./transcript'),
  require('./rename'),
  require('./user'),
  require('./stats'),
  require('./blacklist'),
  require('./unblacklist'),
];

const builder = new SlashCommandBuilder().setName('ticket').setDescription('Ticket system commands');

const subcommandMap = new Map();
for (const sub of subcommands) {
  builder.addSubcommand(sub.data);
  subcommandMap.set(sub.data.name, sub);
}

module.exports = {
  data: builder,
  async execute(interaction, client) {
    const subName = interaction.options.getSubcommand();
    const handler = subcommandMap.get(subName);
    if (!handler) {
      logger.warn(`Subcomando desconocido: ${subName}`);
      await interaction.reply({ embeds: [errorEmbed('Unrecognized subcommand.')], ephemeral: true });
      return;
    }
    await handler.execute(interaction, client);
  },
};
