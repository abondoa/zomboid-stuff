import {RconClient} from './rcon';
import {
  Interaction,
  Client,
  GatewayIntentBits,
  REST,
  SlashCommandBuilder,
  Routes,
} from "discord.js";
const { clientId, token, host, port, password } = require("./config.json");

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageTyping],
});

const commands = [
  new SlashCommandBuilder()
    .setName("zb-restart")
    .setDescription("Restarts the server"),
    new SlashCommandBuilder()
      .setName("zb-players")
      .setDescription("Lists the players currently online"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);
const rcon = new RconClient(host, port, password);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then((data) =>
    console.log(`Successfully registered application commands.`)
  )
  .catch(console.error);

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(
    `Got interaction:\n${JSON.stringify(
      interaction,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      4
    )}`
  );

  const { commandName } = interaction;

  switch(commandName) {
    case "zb-restart": {
      const players = await rcon.players();
      if(players.length > 0) {
        await interaction.reply("Players are online. No restart for you!");
      } else {
        await rcon.sendCommand("restart");
        await interaction.reply("Restart initiated");
      }
      break;
    }
    case "zb-players": {
      await interaction.reply('Players online: ' + (await rcon.players()).join(', '));
      break;
    }
  }
  
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

// Login to Discord with your client's token
client.login(token);
