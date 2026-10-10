# Discord Ticketing Bot

Bot de tickets de soporte para servidores de Discord. Los usuarios abren un ticket desde un panel y el staff lo atiende en un canal privado: lo reclama, lo bloquea, agrega gente, genera la transcripción y lo cierra con botones.

**Stack:** Node.js, discord.js v14, SQLite (better-sqlite3), Express.

## Qué tiene

- Panel público con categorías configurables y textos en español o inglés.
- Comandos `/ticket` para setup, panel, cierre, reclamo, bloqueo, renombrar, transcripción, estadísticas y lista negra.
- Botones, menús y modales para las acciones frecuentes, con un handler por archivo en `src/buttons`, `src/menus` y `src/modals`.
- Transcripciones y registro de actividad del staff.
- Editor web local para cambiar textos, emojis y colores del panel sin reiniciar el bot. Solo escucha en `127.0.0.1`.
- Todo se guarda en SQLite, sin base de datos externa.

## Correrlo

Requiere Node.js 18+ y una aplicación de Discord con bot.

```bash
npm install
cp .env.example .env
npm run deploy
npm start
```

En `.env` van `DISCORD_TOKEN` y `CLIENT_ID`. `GUILD_ID` es opcional y sirve para registrar los comandos al instante en un servidor de prueba.

En el portal de Discord hay que activar los intents Server Members y Message Content, e invitar el bot con los scopes `bot` y `applications.commands`.

Primer uso: `/ticket setup` y después `/ticket panel`. El editor queda en `http://localhost:3001`. En un hosting compartido conviene `WEB_ENABLED=false`.
