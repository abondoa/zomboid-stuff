import { CLIInterface } from "./cli";
import { DiscordInterface } from "./discord";

const config = require("./config.json");
const mode = process.env.MODE || "discord"; // Set MODE=cli to run in CLI mode

// Initialize based on mode
if (mode === "cli") {
  initializeCLI();
} else {
  initializeDiscord();
}

async function initializeCLI(): Promise<void> {
  const { host, port, password } = config;
  const cli = new CLIInterface(host, port, password);
  await cli.start();
}

async function initializeDiscord(): Promise<void> {
  const { clientId, token, host, port, password } = config;
  const discord = new DiscordInterface(clientId, token, host, port, password);
  await discord.start();
}
