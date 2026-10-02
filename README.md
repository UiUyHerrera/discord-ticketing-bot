# Discord Ticketing Bot

Sistema de tickets de soporte para servidores de Discord, desarrollado con discord.js v14 y SQLite. Los usuarios abren tickets desde un panel público; el equipo puede reclamarlos, bloquearlos, generar transcripciones y cerrarlos desde botones.

[English version](#english)

## Funciones

- Panel público y categorías de tickets configurables.
- Asignación, bloqueo, reapertura, cierre y eliminación de tickets.
- Gestión de participantes y generación de transcripciones.
- Registro de actividad, estadísticas y lista de bloqueo.
- Personalización en caliente de textos, emojis y colores mediante comandos o editor web local.
- Persistencia local con SQLite; no requiere una base de datos externa.

## Requisitos

- Node.js 18 o superior (recomendado: 20 o 22).
- Aplicación y bot de Discord.

## Instalación y configuración

~~~bash
npm install
~~~

Copia .env.example a .env y configura DISCORD_TOKEN y CLIENT_ID. GUILD_ID es opcional para registrar comandos inmediatamente en un servidor de prueba. DATABASE_PATH, WEB_ENABLED y WEB_PORT también son opcionales; consulta la tabla de variables en el archivo .env.example.

En el portal de desarrolladores de Discord, habilita los intents privilegiados Server Members y Message Content. Invita el bot con los scopes bot y applications.commands, y los permisos para ver/administrar canales, administrar roles, enviar mensajes, insertar enlaces, adjuntar archivos y leer el historial. El rol del bot debe estar por encima de los roles del equipo.

## Ejecutar

~~~bash
npm run deploy
npm start
~~~

Vuelve a ejecutar npm run deploy cuando cambies los comandos. npm run dev inicia el bot con recarga automática. El primer uso se configura con /ticket setup; luego publica el panel con /ticket panel.

## Comandos

Todos los comandos pertenecen a /ticket. setup, panel, config y theme son para administradores; close, delete, add/remove, claim/unclaim, lock/unlock, rename, transcript, user, stats y blacklist/unblacklist están sujetos a permisos del ticket o del equipo. Los canales incluyen botones para las acciones más frecuentes.

## Editor de tema y despliegue

El editor se sirve en http://localhost:3001 y solo escucha en 127.0.0.1. Los cambios se aplican inmediatamente y se guardan en SQLite. En servidores compartidos, configura WEB_ENABLED=false.

Para bot-hosting.net, usa Node.js 20 o 22, npm start y src/index.js. Configura DISCORD_TOKEN, CLIENT_ID y WEB_ENABLED=false como variables del panel; no subas .env ni archivos de datos. Registra los comandos desde la consola con node deploy-commands.js.

## English

A Discord support-ticket system built with discord.js v14 and SQLite. Users open tickets through a public panel; staff can claim, lock, transcript, close, reopen, and delete tickets using channel buttons.

### Features

- Public ticket panel and configurable categories.
- Ticket assignment, locking, reopening, closing, and deletion.
- Participant management and transcript generation.
- Activity logs, statistics, and blacklist management.
- Live editing of text, emoji, and colors through commands or a local web editor.
- Local SQLite storage; no external database is required.

### Requirements

- Node.js 18 or newer (20 or 22 recommended).
- A Discord application with a bot user.

### Install and configure

~~~bash
npm install
~~~

Copy .env.example to .env and set DISCORD_TOKEN and CLIENT_ID. GUILD_ID is optional and enables immediate command registration in a test server. DATABASE_PATH, WEB_ENABLED, and WEB_PORT are optional; see .env.example for details.

In the Discord Developer Portal, enable the privileged Server Members and Message Content intents. Invite the bot with the bot and applications.commands scopes and permissions to view/manage channels, manage roles, send messages, embed links, attach files, and read message history. Place the bot role above staff roles.

### Run

~~~bash
npm run deploy
npm start
~~~

Run npm run deploy again whenever commands change. npm run dev starts the bot with automatic reloading. Use /ticket setup for the initial configuration, then publish the panel with /ticket panel.

### Commands

All commands are subcommands of /ticket. setup, panel, config, and theme are for administrators; close, delete, add/remove, claim/unclaim, lock/unlock, rename, transcript, user, stats, and blacklist/unblacklist are available according to ticket or staff permissions. Ticket channels include buttons for common actions.

### Theme editor and deployment

The editor is served at http://localhost:3001 and binds only to 127.0.0.1. Changes apply immediately and are stored in SQLite. Set WEB_ENABLED=false on shared hosting.

For bot-hosting.net, choose Node.js 20 or 22, use npm start and src/index.js, and set DISCORD_TOKEN, CLIENT_ID, and WEB_ENABLED=false as panel variables. Do not upload .env or data files. Register commands from the console with node deploy-commands.js.
# Ticket Bot

A Discord support-ticket system built with discord.js v14 and SQLite. Users open tickets from a
public panel; staff claim, lock, transcript and close them from buttons inside each ticket channel.

Everything that the bot says (labels, embeds, colors, emojis) can be edited at runtime, either from
`/ticket theme` in Discord or from a small web editor that runs on localhost.

## Requirements

- Node.js 18 or newer (20/22 recommended)
- A Discord application with a bot user
- No external database: SQLite is stored in a local file

## Installation

```bash
npm install
```

`better-sqlite3` ships prebuilt N-API binaries for Windows, macOS and Linux, so no C++ toolchain is
required.

## Discord application

1. Create an application at <https://discord.com/developers/applications> and add a bot user.
2. Under **Bot**, reset the token and copy it, then enable the `SERVER MEMBERS` and
   `MESSAGE CONTENT` privileged intents.
3. Copy the **Application ID** from **General Information** — that is `CLIENT_ID`.
4. Under **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes plus these
   permissions: View Channels, Manage Channels, Manage Roles, Send Messages, Embed Links,
   Attach Files, Read Message History. Open the generated URL to invite the bot.

The bot's role must sit above the staff roles in **Server Settings → Roles**, otherwise it cannot
manage per-channel permissions.

## Configuration

Copy `.env.example` to `.env` and fill it in:

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | yes | Bot token |
| `CLIENT_ID` | yes | Application ID |
| `GUILD_ID` | no | Registers slash commands instantly in a single guild. Leave empty for global registration (up to 1 hour to propagate) |
| `DATABASE_PATH` | no | SQLite file path. Defaults to `./data/database.sqlite` |
| `WEB_ENABLED` | no | Set to `false` to disable the web theme editor |
| `WEB_PORT` | no | Port for the web theme editor. Defaults to `3001` |

## Running

```bash
npm run deploy
```

```bash
npm start
```

`npm run deploy` registers the slash commands and only needs to be re-run when a command is added or
changed. `npm run dev` starts the bot with `node --watch`.

## First-time server setup

1. Run `/ticket setup` and fill in the panel channel, open/closed categories, staff role, log and
   transcript channels, ticket name prefix, starting number, embed color and panel message.
2. Review the ticket categories with `/ticket config action:View categories`, and add or edit them
   with `/ticket config action:Add / edit category`.
3. Publish the panel with `/ticket panel`.

## Commands

All commands are subcommands of `/ticket`.

| Command | Description | Access |
|---|---|---|
| `setup` | Configuration wizard | Admins |
| `panel` | Publish the ticket panel | Admins |
| `config` | Manage ticket categories | Admins |
| `theme` | Edit the bot's texts, emojis and colors | Admins |
| `close` | Ask for confirmation to close the current ticket | Ticket owner or staff |
| `delete` | Permanently delete the current ticket channel | Staff |
| `add` / `remove` | Add or remove a user from the current ticket | Staff |
| `claim` / `unclaim` | Claim or release the current ticket | Staff |
| `lock` / `unlock` | Prevent or allow the user from typing | Staff |
| `rename` | Rename the ticket channel | Staff |
| `transcript` | Generate the transcript of the current ticket | Ticket owner or staff |
| `user` | Show information about the current ticket | Anyone in the channel |
| `stats` | Ticket system statistics | Staff |
| `blacklist` / `unblacklist` | Block or unblock a user from opening tickets | Admins |

Each ticket channel also carries buttons for close, claim/unclaim, lock/unlock, transcript and
add/remove user. Closed tickets additionally show delete and reopen.

## Theme editor

While the bot is running, `http://localhost:3001` serves a web editor for every string, emoji and
color the bot uses. It binds to `127.0.0.1` only and has no authentication, so it is never reachable
from outside the machine the bot runs on. Changes are written to the `theme_overrides` table and
apply immediately without a restart.

Set `WEB_ENABLED=false` to skip it entirely, which is the recommended setting when the bot runs on a
shared host.

Defaults live in `src/theme.js` (English) and `src/theme.es.js` (Spanish); overrides made through the
editor or `/ticket theme` take precedence over both.

## Deploying to bot-hosting.net

1. Create a server on <https://bot-hosting.net> and pick the Node.js egg with Node 20 or 22.
2. In **Startup**, set the startup command to `npm start` and the main file to `src/index.js`.
3. In **Files**, upload the project without `node_modules`, `.env`, `data/` and `transcripts/`, or
   pull it from Git. For a private repository, use a personal access token in the clone URL.
4. Add `DISCORD_TOKEN`, `CLIENT_ID` and `WEB_ENABLED=false` as startup variables in the panel rather
   than committing a `.env` file.
5. Start the server once so `npm install` runs, then run `node deploy-commands.js` from the console
   to register the slash commands.

`data/` and `transcripts/` live on the container's disk and persist across restarts. Back up
`data/database.sqlite` before reinstalling the server, since a reinstall wipes the filesystem.

## Project layout

```
src/
  commands/ticket/   /ticket subcommands
  events/            ready, interactionCreate, guildCreate
  buttons/           button handlers
  menus/             select menu handlers
  modals/            modal submit handlers
  services/          tickets, config, transcripts, logs, theme
  utils/             embeds, permissions, ids, time helpers
  handlers/          component and event autoloading
  database/          schema.sql and the SQLite connection
  theme.js           default English strings
  theme.es.js        default Spanish strings
  webServer.js       localhost theme editor API
public/index.html    theme editor UI
```

## Troubleshooting

**Commands do not show up in Discord.** Run `npm run deploy`. Global registration can take up to an
hour; set `GUILD_ID` while testing to make it instant.

**"This interaction failed".** The bot process is not running, or it logged an error — check the
console output.

**"Missing Permissions" when creating a channel.** The bot needs Manage Channels and Manage Roles,
and its role must be above the staff roles.

**"database is locked".** Two instances of the bot are running against the same SQLite file.

**Ticket numbering.** Numbers are never reused. Change the next number from `/ticket setup`.
