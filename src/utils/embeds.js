'use strict';

const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const theme = require('../services/liveTheme');

function baseEmbed(color) {
  return new EmbedBuilder()
    .setColor(color || config.defaultColor)
    .setTimestamp();
}

function successEmbed(description, title = theme.embeds.successTitle) {
  return baseEmbed(config.colors.success).setTitle(title).setDescription(description);
}

function errorEmbed(description, title = theme.embeds.errorTitle) {
  return baseEmbed(config.colors.danger).setTitle(title).setDescription(description);
}

function warningEmbed(description, title = theme.embeds.warningTitle) {
  return baseEmbed(config.colors.warning).setTitle(title).setDescription(description);
}

function infoEmbed(description, title = theme.embeds.infoTitle) {
  return baseEmbed(config.colors.info).setTitle(title).setDescription(description);
}

module.exports = { baseEmbed, successEmbed, errorEmbed, warningEmbed, infoEmbed };
