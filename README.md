# Zomboid Server CLI / Discord Bot

A dual-mode TypeScript app to interact with a Project Zomboid server over RCON. It can run as a Discord bot (slash commands) or as an interactive CLI; both use the same command handlers.

Supported commands

- `zb-restart` — Restart the server (won't restart if players are online)
- `zb-players` — List online players
- `zb-mods` — List active mods (shows mod id and workshop item)
- `zb-addworkshopitem --workshopid <id>` — Add a Steam Workshop item to the server (updates `WorkshopItems` and `Mods`)
- `zb-workshopinfo --workshopid <id>` — Lookup Steam Workshop information for an ID

Configuration

Create a `config.json` (placed next to `index.ts`) containing the RCON and Discord settings used at startup:

```json
{
  "host": "<RCON host or IP>",
  "port": 27015,
  "password": "<RCON password>",
  "token": "<Discord bot token - for Discord mode only>",
  "clientId": "<Discord client ID - for Discord mode only>"
}
```

Running

Build

```bash
npm run build
```

Development (interprets TypeScript at runtime)

```bash
npm install
npm run dev         # run in default mode (discord by default)
npm run dev:discord # force discord mode
npm run dev:cli     # force CLI mode
```

Production (compiled JS in `dist`)

```bash
npm run start:discord  # run as Discord bot
npm run start:cli      # run CLI (non-interactive args supported)
```

Scripts and MODE

- The app reads `process.env.MODE`; valid values are `discord` (default) or `cli`.
- `start:discord` and `start:cli` set `MODE` for you when running the compiled `dist/index.js`.

Docker

Use `docker-compose up` to run the container. To run the CLI variant set `MODE=cli` in the compose environment or when invoking Docker:

```bash
MODE=cli docker-compose up
```

Discord setup

1. Create a Discord bot and obtain its token and client ID (see discord.js guide).
2. Add `token` and `clientId` to `config.json`.
3. The bot will register slash commands on startup.

Notes for contributors

- CLI commands are implemented in `commandsRegistry.ts` and delegate to `CommandHandler` in `commands.ts`.
- The CLI uses `yargs` to parse commands; boolean/number/string options map to each command's `options` descriptor.
