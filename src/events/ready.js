'use strict';

const { Events } = require('discord.js');
const logger = require('../utils/logger');
const configService = require('../services/configService');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Sesión iniciada como ${client.user.tag} (${client.user.id})`);

    for (const guild of client.guilds.cache.values()) {
      try {
        configService.getOrCreateGuildConfig(guild.id);
      } catch (err) {
        logger.error(`No se pudo inicializar configuración para ${guild.id}:`, err);
      }
    }

    logger.info(`Bot activo en ${client.guilds.cache.size} servidor(es).`);
  },
};
