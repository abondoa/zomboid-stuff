import {
  Interaction,
  Client,
  GatewayIntentBits,
  REST,
  SlashCommandBuilder,
  Routes,
} from "discord.js";
import { CommandHandler } from "./commands";
import { CLIInterface } from "./cli";
import { RconClient } from "./rcon";

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

  // Create a new client instance
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageTyping],
  });

  const commandHandler = new CommandHandler(
    new RconClient(host, port, password),
  );

  const commands = [
    new SlashCommandBuilder()
      .setName("zb-restart")
      .setDescription("Restarts the server"),
    new SlashCommandBuilder()
      .setName("zb-players")
      .setDescription("Lists the players currently online"),
    new SlashCommandBuilder()
      .setName("zb-mods")
      .setDescription("Lists the mods currently active on the server"),
    new SlashCommandBuilder()
      .setName("zb-addmod")
      .addIntegerOption((option) =>
        option
          .setName("modid")
          .setDescription("The ID of the mod to add")
          .setRequired(true),
      )
      .setDescription("Adds a mod to the server"),
    new SlashCommandBuilder()
      .setName("zb-workshopinfo")
      .addStringOption((option) =>
        option
          .setName("workshopid")
          .setDescription("The Steam Workshop ID to look up")
          .setRequired(true),
      )
      .setDescription("Look up Steam Workshop mod information"),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(token);

  rest
    .put(Routes.applicationCommands(clientId), { body: commands })
    .then((data) =>
      console.log(`Successfully registered application commands.`),
    )
    .catch(console.error);

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(`Got interaction for command: ${interaction.commandName}`);

    const { commandName } = interaction;

    try {
      switch (commandName) {
        case "zb-restart": {
          const result = await commandHandler.restart();
          await interaction.reply(result);
          break;
        }
        case "zb-players": {
          const result = await commandHandler.players();
          await interaction.reply(result);
          break;
        }
        case "zb-mods": {
          const result = await commandHandler.mods();
          await interaction.reply(result);
          break;
        }
        case "zb-addmod": {
          const modId = interaction.options.getInteger("modid", true);
          const result = await commandHandler.addmod(modId);
          await interaction.reply(result);
          break;
        }
        case "zb-workshopinfo": {
          const workshopId = interaction.options.getString("workshopid", true);
          const result = await commandHandler.workshopinfo(workshopId);
          await interaction.reply(result);
          break;
        }
      }
    } catch (error) {
      await interaction.reply(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  // When the client is ready, run this code (only once)
  client.once("ready", () => {
    console.log("Discord bot ready!");
  });

  // Login to Discord with your client's token
  client.login(token);
}
