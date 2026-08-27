'use strict';

const path = require('node:path');
const express = require('express');
const logger = require('./utils/logger');
const fields = require('./services/themeFields');
const theme = require('./services/liveTheme');
const mutate = require('./services/themeMutate');

const PORT = Number(process.env.WEB_PORT) || 3001;
const HOST = '127.0.0.1';

function getItemValue(item) {
  if (item.type === 'text') return { value: fields.getPath(theme, item.path) ?? '' };
  if (item.type === 'label_emoji') {
    return { label: fields.getPath(theme, item.labelPath) ?? '', emoji: fields.getPath(theme, item.emojiPath) ?? '' };
  }
  if (item.type === 'title_color') {
    return { title: fields.getPath(theme, item.titlePath) ?? '', color: fields.getPath(theme, item.colorPath) ?? '' };
  }
  return {};
}

function serializeCategories() {
  return fields.CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    isColorCategory: cat.key === 'colors',
    items: cat.items.map((item) => ({
      key: item.key,
      label: item.label,
      type: item.type,
      long: !!item.long,
      style: item.style || null,
      ...getItemValue(item),
    })),
  }));
}

function startWebServer(client) {
  if (String(process.env.WEB_ENABLED).toLowerCase() === 'false') return;

  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/data', (req, res) => {
    const guild = client.guilds.cache.first();
    res.json({
      categories: serializeCategories(),
      defaultColor: theme.colors.default,
      guild: guild ? { id: guild.id, name: guild.name } : null,
    });
  });

  app.get('/api/emojis', async (req, res) => {
    const guild = client.guilds.cache.first();
    if (!guild) return res.json({ emojis: [] });
    try {
      const emojis = await guild.emojis.fetch();
      res.json({
        emojis: [...emojis.values()]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((e) => ({ id: e.id, name: e.name, animated: e.animated })),
      });
    } catch (err) {
      logger.error('Error obteniendo emojis para el editor web:', err);
      res.status(500).json({ emojis: [], error: 'No se pudieron obtener los emojis del servidor.' });
    }
  });

  app.post('/api/set', async (req, res) => {
    const { itemKey, values } = req.body || {};
    const found = fields.findItem(itemKey);
    if (!found) return res.status(404).json({ ok: false, error: 'Campo no encontrado.' });
    const { category, item } = found;

    if (item.type === 'text') {
      return res.json({ ...mutate.applyText(item, category, values?.value), value: getItemValue(item) });
    }

    if (item.type === 'title_color') {
      return res.json({ ...mutate.applyTitleColor(item, values?.title, values?.color), value: getItemValue(item) });
    }

    if (item.type === 'label_emoji') {
      const labelResult = mutate.applyButtonLabel(item, values?.label);
      if (!labelResult.ok) return res.json(labelResult);

      if (values?.emojiGuildId) {
        const guild = client.guilds.cache.first();
        const guildEmoji = guild && (guild.emojis.cache.get(values.emojiGuildId) || (await guild.emojis.fetch(values.emojiGuildId).catch(() => null)));
        if (!guildEmoji) return res.json({ ok: false, error: 'No se encontró ese emoji en el servidor. Puede que lo hayan borrado.' });
        theme.setOverride(item.emojiPath, mutate.formatCustomEmojiTag(guildEmoji));
      } else if (values?.emojiClear) {
        theme.setOverride(item.emojiPath, '');
      } else {
        const emojiResult = mutate.applyButtonEmoji(item, values?.emoji);
        if (!emojiResult.ok) return res.json(emojiResult);
      }

      return res.json({ ok: true, value: getItemValue(item) });
    }

    res.status(400).json({ ok: false, error: 'Tipo de campo desconocido.' });
  });

  app.post('/api/reset-category', (req, res) => {
    const category = fields.findCategory(req.body?.categoryKey);
    if (!category) return res.status(404).json({ ok: false, error: 'Sección no encontrada.' });
    theme.resetPaths(category.items.flatMap(fields.itemLeafPaths));
    res.json({ ok: true, category: serializeCategories().find((c) => c.key === category.key) });
  });

  app.post('/api/reset-all', (req, res) => {
    theme.resetAll();
    res.json({ ok: true, categories: serializeCategories() });
  });

  const server = app.listen(PORT, HOST, () => {
    logger.info(`Editor de tema disponible en http://localhost:${PORT} (solo accesible desde esta PC)`);
  });

  server.on('error', (err) => {
    logger.error(`No se pudo abrir el editor de tema en el puerto ${PORT}:`, err.message);
  });
}

module.exports = { startWebServer };
