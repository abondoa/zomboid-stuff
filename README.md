# Zomboid Server CLI/Discord Bot

This is a dual-mode application that allows you to interact with a Zomboid Server via RCON either through Discord or via a command-line interface. Both modes support the same commands:

- `zb-restart` - Restart the server
- `zb-players` - List online players
- `zb-mods` - List active mods
- `zb-addmod <modid>` - Add a mod by Steam Workshop ID

## Configuration

Create a `config.json` file with the RCON server credentials:

```json
{
    "host": "<Hostname or IP of the RCON server>",
    "port": <Port for the RCON server>,
    "password": "<Password for the RCON server>",
    "token": "<Token for the Discord bot (Discord mode only)>",
    "clientId": "<Client ID for the Discord bot (Discord mode only)>"
}
```

## Running

### Build

```bash
npm run build
```

### Discord Mode (Default)

This mode runs the application as a Discord bot with slash commands.

**Development:**

```bash
npm run dev:discord
```

**Production:**

```bash
npm run start:discord
```

**Docker:**

```bash
docker-compose up
```

### CLI Mode

This mode runs an interactive command-line interface where you can type commands directly.

**Development:**

```bash
npm run dev:cli
```

**Production:**

```bash
npm run start:cli
```

**Docker:**

```bash
MODE=cli docker-compose up
```

Or in docker-compose.yml:

```yaml
environment:
  - MODE=cli
```

## Discord Setup

For Discord mode, you need to set up a Discord bot:

1. Follow the guide from https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot
2. Get the bot token and client ID
3. Add them to the `config.json` file
4. The bot will automatically register slash commands on startup

## Development

**Install dependencies:**

```bash
npm install
```

**Run in development (Discord mode by default):**

```bash
npm run dev
```

**Run in CLI mode:**

```bash
npm run dev:cli
```

**Watch and compile TypeScript:**

```bash
npm run build
```
