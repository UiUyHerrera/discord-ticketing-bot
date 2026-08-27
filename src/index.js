'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const logger = require('./utils/logger');
const { loadAllHandlers, loadEvents } = require('./handlers/loadHandlers');
const { startWebServer } = require('./webServer');

if (!process.env.DISCORD_TOKEN) {
  logger.error('Falta DISCORD_TOKEN en el archivo .env. Copia .env.example a .env y complétalo.');
  process.exit(1);
}
if (!process.env.CLIENT_ID) {
  logger.error('Falta CLIENT_ID en el archivo .env. Copia .env.example a .env y complétalo.');
  process.exit(1);
}

require('./database/db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

loadAllHandlers(client);
loadEvents(client);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  logger.error('No se pudo iniciar sesión con el token proporcionado:', err.message);
  process.exit(1);
});

startWebServer(client);
