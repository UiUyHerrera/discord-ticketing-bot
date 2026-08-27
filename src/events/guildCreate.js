'use strict';

const { Events } = require('discord.js');
const logger = require('../utils/logger');
const configService = require('../services/configService');

module.exports = {
  name: Events.GuildCreate,
  once: false,
  async execute(guild) {
    try {
      configService.getOrCreateGuildConfig(guild.id);
      logger.info(`Bot añadido a un nuevo servidor: ${guild.name} (${guild.id}). Configuración inicial creada.`);
    } catch (err) {
      logger.error(`Error inicializando configuración para el nuevo servidor ${guild.id}:`, err);
    }
  },
};
