import {
  Interaction,
  Client,
  GatewayIntentBits,
  REST,
  SlashCommandBuilder,
  Routes,
} from "discord.js";
import { CommandHandler } from "./commands";
import { RconClient } from "./rcon";
import { commands as registry } from "./commandsRegistry";
import { buildSlashCommand, extractDiscordArgs } from "./commandAdapter";

export class DiscordInterface {
  private clientId: string;
  private token: string;
  private host: string;
  private port: number;
  private password: string;

  constructor(
    clientId: string,
    token: string,
    host: string,
    port: number,
    password: string,
  ) {
    this.clientId = clientId;
    this.token = token;
    this.host = host;
    this.port = port;
    this.password = password;
  }

  async start(): Promise<void> {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageTyping],
    });

    const commandHandler = new CommandHandler(new RconClient(this.host, this.port, this.password));

    const commands = registry.map((d) => buildSlashCommand(d).toJSON());

    const rest = new REST({ version: "10" }).setToken(this.token);

    rest
      .put(Routes.applicationCommands(this.clientId), { body: commands })
      .then(() => console.log(`Successfully registered application commands.`))
      .catch(console.error);

    client.on("interactionCreate", async (interaction: Interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const { commandName } = interaction;
      const desc = registry.find((d) => d.name === commandName);
      if (!desc) return;
      console.log(`Got interaction for command: ${interaction.commandName}`);
      try {
        const args = extractDiscordArgs(desc, interaction);
        const result = await desc.executor({ handler: commandHandler, args, source: "discord" });
        await interaction.reply(typeof result === "string" ? result : JSON.stringify(result));
      } catch (error) {
        await interaction.reply(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    client.once("ready", () => {
      console.log("Discord bot ready!");
    });

    await client.login(this.token);
  }
}
