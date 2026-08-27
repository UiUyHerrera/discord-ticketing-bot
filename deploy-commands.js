'use strict';

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const logger = require('./src/utils/logger');
const { getCommandModules } = require('./src/handlers/loadHandlers');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  logger.error('Faltan DISCORD_TOKEN y/o CLIENT_ID en el archivo .env.');
  process.exit(1);
}

async function main() {
  const commandModules = getCommandModules();
  const body = commandModules.map((c) => c.data.toJSON());

  logger.info(`Registrando ${body.length} comando(s): ${commandModules.map((c) => c.data.name).join(', ')}`);

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });
      logger.info(`Comandos registrados correctamente en el servidor ${GUILD_ID} (instantáneo).`);
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
      logger.info('Comandos registrados correctamente de forma global (puede tardar hasta 1 hora en propagarse).');
    }
  } catch (err) {
    logger.error('Error registrando los comandos:', err);
    process.exit(1);
  }
}

main();
