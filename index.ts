import { RconClient } from "./rcon";
import {
  Interaction,
  Client,
  GatewayIntentBits,
  REST,
  SlashCommandBuilder,
  Routes,
} from "discord.js";
const { clientId, token, host, port, password } = require("./config.json");

interface ServerOptions {
  AdminSafehouse?: string;
  AllowCoop?: string;
  AllowDestructionBySledgehammer?: string;
  AllowNonAsciiUsername?: string;
  AnnounceDeath?: string;
  AntiCheatProtectionType1?: string;
  AntiCheatProtectionType10?: string;
  AntiCheatProtectionType11?: string;
  AntiCheatProtectionType12?: string;
  AntiCheatProtectionType13?: string;
  AntiCheatProtectionType14?: string;
  AntiCheatProtectionType15?: string;
  AntiCheatProtectionType15ThresholdMultiplier?: string;
  AntiCheatProtectionType16?: string;
  AntiCheatProtectionType17?: string;
  AntiCheatProtectionType18?: string;
  AntiCheatProtectionType19?: string;
  AntiCheatProtectionType2?: string;
  AntiCheatProtectionType20?: string;
  AntiCheatProtectionType20ThresholdMultiplier?: string;
  AntiCheatProtectionType21?: string;
  AntiCheatProtectionType22?: string;
  AntiCheatProtectionType22ThresholdMultiplier?: string;
  AntiCheatProtectionType23?: string;
  AntiCheatProtectionType24?: string;
  AntiCheatProtectionType24ThresholdMultiplier?: string;
  AntiCheatProtectionType2ThresholdMultiplier?: string;
  AntiCheatProtectionType3?: string;
  AntiCheatProtectionType3ThresholdMultiplier?: string;
  AntiCheatProtectionType4?: string;
  AntiCheatProtectionType4ThresholdMultiplier?: string;
  AntiCheatProtectionType5?: string;
  AntiCheatProtectionType6?: string;
  AntiCheatProtectionType7?: string;
  AntiCheatProtectionType8?: string;
  AntiCheatProtectionType9?: string;
  AntiCheatProtectionType9ThresholdMultiplier?: string;
  AutoCreateUserInWhiteList?: string;
  BackupsCount?: string;
  BackupsOnStart?: string;
  BackupsOnVersionChange?: string;
  BackupsPeriod?: string;
  BanKickGlobalSound?: string;
  BloodSplatLifespanDays?: string;
  CarEngineAttractionModifier?: string;
  ChatStreams?: string;
  ClientActionLogs?: string;
  ClientCommandFilter?: string;
  ConstructionPreventsLootRespawn?: string;
  DefaultPort?: string;
  DenyLoginOnOverloadedServer?: string;
  DisableRadioAdmin?: string;
  DisableRadioGM?: string;
  DisableRadioInvisible?: string;
  DisableRadioModerator?: string;
  DisableRadioOverseer?: string;
  DisableRadioStaff?: string;
  DisableSafehouseWhenPlayerConnected?: string;
  DiscordEnable?: string;
  DisplayUserName?: string;
  DoLuaChecksum?: string;
  DropOffWhiteListAfterDeath?: string;
  Faction?: string;
  FactionDaySurvivedToCreate?: string;
  FactionPlayersRequiredForTag?: string;
  FastForwardMultiplier?: string;
  GlobalChat?: string;
  HidePlayersBehindYou?: string;
  HoursForLootRespawn?: string;
  ItemNumbersLimitPerContainer?: string;
  KickFastPlayers?: string;
  KnockedDownAllowed?: string;
  LoginQueueConnectTimeout?: string;
  LoginQueueEnabled?: string;
  Map?: string;
  MapRemotePlayerVisibility?: string;
  MaxAccountsPerUser?: string;
  MaxItemsForLootRespawn?: string;
  MaxPlayers?: string;
  MinutesPerPage?: string;
  Mods?: string;
  MouseOverToSeeDisplayName?: string;
  NoFire?: string;
  Open?: string;
  PVP?: string;
  PVPFirearmDamageModifier?: string;
  PVPMeleeDamageModifier?: string;
  PVPMeleeWhileHitReaction?: string;
  PauseEmpty?: string;
  PerkLogs?: string;
  PingLimit?: string;
  PlayerBumpPlayer?: string;
  PlayerRespawnWithOther?: string;
  PlayerRespawnWithSelf?: string;
  PlayerSafehouse?: string;
  Public?: string;
  PublicDescription?: string;
  PublicName?: string;
  RemovePlayerCorpsesOnCorpseRemoval?: string;
  ResetID?: string;
  SafeHouseRemovalTime?: string;
  SafehouseAllowFire?: string;
  SafehouseAllowLoot?: string;
  SafehouseAllowNonResidential?: string;
  SafehouseAllowRespawn?: string;
  SafehouseAllowTrepass?: string;
  SafetyCooldownTimer?: string;
  SafetySystem?: string;
  SafetyToggleTimer?: string;
  SaveWorldEveryMinutes?: string;
  ServerPlayerID?: string;
  ShowFirstAndLastName?: string;
  ShowSafety?: string;
  SledgehammerOnlyInSafehouse?: string;
  SleepAllowed?: string;
  SleepNeeded?: string;
  SneakModeHideFromOtherPlayers?: string;
  SpawnItems?: string;
  SpawnPoint?: string;
  SpeedLimit?: string;
  SteamScoreboard?: string;
  SteamVAC?: string;
  TrashDeleteAll?: string;
  UDPPort?: string;
  UPnP?: string;
  Voice3D?: string;
  VoiceEnable?: string;
  VoiceMaxDistance?: string;
  VoiceMinDistance?: string;
  WorkshopItems?: string;
  server_browser_announced_ip?: string;
  ServerWelcomeMessage?: string;
}

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
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);
const rcon = new RconClient(host, port, password);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then((data) => console.log(`Successfully registered application commands.`))
  .catch(console.error);

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(
    `Got interaction:\n${JSON.stringify(
      interaction,
      (key, value) => (typeof value === "bigint" ? value.toString() : value),
      4,
    )}`,
  );

  const { commandName } = interaction;

  switch (commandName) {
    case "zb-restart": {
      const players = await rcon.players();
      if (players.length > 0) {
        await interaction.reply("Players are online. No restart for you!");
      } else {
        await rcon.sendCommand("quit");
        await interaction.reply("Restart initiated");
      }
      break;
    }
    case "zb-players": {
      await interaction.reply(
        "Players online: " + (await rcon.players()).join(", "),
      );
      break;
    }
    case "zb-mods": {
      await interaction.reply(
        "Active mods: " +
          (await getMods())

            .map((x) => `${x.mod} (${x.workshopItem})`)
            .join(", "),
      );
      break;
    }
  }
});

const getMods = async () => {
  const mods = (await getOptions()).Mods?.split(";")?.map((x) => x.trim());
  const workshopItems = (await getOptions()).WorkshopItems?.split(";")?.map(
    (x) => x.trim(),
  );
  return zip(mods, workshopItems) ?? [];
};

const getOptions = async (): Promise<ServerOptions> => {
  const options = (await rcon.sendCommand("showoptions"))
    .split("\n")
    .filter((x) => x.startsWith("* "))
    ?.map((x) => {
      const splitIndex = x.indexOf("=");
      return {
        name: x.substring(2, splitIndex),
        value: x.substring(splitIndex + 1),
      };
    })
    .reduce((acc, option) => ({ ...acc, [option.name]: option.value }), {});
  return options ?? ({} as ServerOptions);
};

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

// Login to Discord with your client's token
client.login(token);
function zip(mods: string[] | undefined, workshopItems: string[] | undefined) {
  if (!mods || !workshopItems)
    throw new Error("Mods or WorkshopItems is undefined");
  if (mods.length !== workshopItems.length)
    throw new Error("Mods and WorkshopItems have different lengths");
  const length = mods.length;
  const zipped = [];
  for (let i = 0; i < length; i++) {
    zipped.push({ mod: mods[i], workshopItem: workshopItems[i] });
  }
  return zipped;
}

const getModIdFromSteamWorkshop = async (workshopId: string): Promise<string> => {
  try {
    const url = `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`;
    const response = await fetch(url);
    const html = await response.text();

    // Try to extract the mod name from the page title
    // Steam page format: "<title>Workshop :: Mod Name</title>"
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      let modName = titleMatch[1];
      // Remove "Workshop :: " prefix if present
      modName = modName.replace(/^Workshop :: /, "").trim();
      // Return the mod name as the mod ID (this would be the folder name)
      return modName;
    }

    // Fallback: try to find in the appHub_AppName class
    const appNameMatch = html.match(
      /class="appHub_AppName"[^>]*>([^<]+)<\/div>/
    );
    if (appNameMatch) {
      return appNameMatch[1].trim();
    }

    throw new Error("Could not extract mod name from Steam page");
  } catch (error) {
    console.error(`Error fetching Steam workshop item ${workshopId}:`, error);
    throw error;
  }
};
