'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

function readJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return readJsFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith('.js')) return [fullPath];
      return [];
    });
}

function findCommandEntryFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.js');
      if (fs.existsSync(indexPath)) files.push(indexPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function loadCommands(client) {
  client.commands = new Collection();
  const dir = path.join(__dirname, '..', 'commands');
  const files = findCommandEntryFiles(dir);
  for (const file of files) {
    try {
      const command = require(file);
      if (!command?.data || !command?.execute) {
        logger.warn(`Comando inválido (falta data/execute): ${file}`);
        continue;
      }
      client.commands.set(command.data.name, command);
    } catch (err) {
      logger.error(`Error al cargar comando ${file}:`, err);
    }
  }
  logger.info(`Comandos cargados: ${client.commands.size}`);
}

function loadComponentSet(client, folderName, collectionName) {
  client[collectionName] = new Collection();
  const dir = path.join(__dirname, '..', folderName);
  const files = readJsFiles(dir);
  for (const file of files) {
    try {
      const component = require(file);
      const ids = component?.customIds || (component?.customId ? [component.customId] : null);
      if (!ids || !component?.execute) {
        logger.warn(`Componente inválido (falta customId/customIds/execute): ${file}`);
        continue;
      }
      for (const id of ids) {
        client[collectionName].set(id, component);
      }
    } catch (err) {
      logger.error(`Error al cargar componente ${file}:`, err);
    }
  }
  logger.info(`${collectionName} cargados: ${client[collectionName].size}`);
}

function loadAllHandlers(client) {
  loadCommands(client);
  loadComponentSet(client, 'buttons', 'buttons');
  loadComponentSet(client, 'menus', 'menus');
  loadComponentSet(client, 'modals', 'modals');
}

function loadEvents(client) {
  const dir = path.join(__dirname, '..', 'events');
  const files = readJsFiles(dir);
  for (const file of files) {
    try {
      const event = require(file);
      if (!event?.name || !event?.execute) {
        logger.warn(`Evento inválido (falta name/execute): ${file}`);
        continue;
      }
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    } catch (err) {
      logger.error(`Error al cargar evento ${file}:`, err);
    }
  }
}

function getCommandModules() {
  const dir = path.join(__dirname, '..', 'commands');
  const files = findCommandEntryFiles(dir);
  const commands = [];
  for (const file of files) {
    try {
      const command = require(file);
      if (!command?.data || !command?.execute) {
        logger.warn(`Comando inválido (falta data/execute): ${file}`);
        continue;
      }
      commands.push(command);
    } catch (err) {
      logger.error(`Error al cargar comando ${file}:`, err);
    }
  }
  return commands;
}

module.exports = { loadAllHandlers, loadEvents, readJsFiles, getCommandModules };
