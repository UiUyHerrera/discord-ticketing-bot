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

`better-sqlite3` is a native module. On Windows it may need the "Desktop development with C++"
workload from the Visual Studio Build Tools; on Debian/Ubuntu, `build-essential` and `python3`.

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

**`better-sqlite3` fails to install.** Install a C++ toolchain: Visual Studio Build Tools on Windows,
`xcode-select --install` on macOS, `build-essential python3` on Debian/Ubuntu.

**Ticket numbering.** Numbers are never reused. Change the next number from `/ticket setup`.
