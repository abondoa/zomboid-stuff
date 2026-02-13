import { Rcon } from "rcon-client";

export const OPTION_CACHE_ENABLED = false;

export interface ServerOptions {
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
export class RconClient {
  private rcon: Promise<Rcon>;
  private running: boolean;
  private optionsCache: ServerOptions | undefined;
  private reconnectAttempts: number = 0;
  private isReconnecting: boolean = false;
  private maxReconnectAttempts: number = 5;
  private reconnectDelayMs: number = 100;
  private intentionallyClosed: boolean = false;
  private password: string;
  private host: string;
  private port: number;

  constructor(host: string, port: number, password: string) {
    this.host = host;
    this.port = port;
    this.password = password;
    this.rcon = Rcon.connect({
      host,
      port,
      password,
    });
    this.running = true;
    this.setupConnectionListener();
  }

  private setupConnectionListener(): void {
    this.rcon
      .then((client) => {
        client.on("end", () => {
          if (!this.intentionallyClosed) {
            this.running = false;
            console.log("RCON connection ended unexpectedly");
          }
        });
      })
      .catch(() => {
        // Connection failed initially, will be handled in sendCommand
      });
  }

  private async reconnect(): Promise<void> {
    if (this.isReconnecting || this.intentionallyClosed) {
      return;
    }

    this.isReconnecting = true;

    try {
      while (this.reconnectAttempts < this.maxReconnectAttempts) {
        try {
          const delay =
            Math.pow(2, this.reconnectAttempts) * this.reconnectDelayMs;
          console.log(
            `RCON reconnection attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}, waiting ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Create new connection
          this.rcon = Rcon.connect({
            host: this.host,
            port: this.port,
            password: this.password,
          });

          await this.rcon; // Wait for connection to establish
          this.running = true;
          this.reconnectAttempts = 0;
          this.optionsCache = undefined; // Clear cache on successful reconnect
          console.log("RCON successfully reconnected");
          this.setupConnectionListener();
          return;
        } catch (err) {
          this.reconnectAttempts++;
          console.error(
            `RCON reconnection attempt ${this.reconnectAttempts} failed:`,
            err,
          );
        }
      }

      throw new Error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`,
      );
    } finally {
      this.isReconnecting = false;
    }
  }

  private async sendCommand(command: string): Promise<string> {
    if (!this.running) {
      await this.reconnect();
      if (!this.running) {
        throw new Error("Unable to send commands - reconnection failed");
      }
    }
    return (await this.rcon).send(command);
  }

  public async players(): Promise<string[]> {
    const res = await this.sendCommand("players");
    return res
      .split("\n")
      .slice(1)
      .filter((x) => x != "")
      .map((x) => x.substring(1));
  }

  public async options(): Promise<ServerOptions> {
    const parseOptions = (raw: string): ServerOptions =>
      raw
        .split("\n")
        .filter((x) => x.startsWith("* "))
        .map((x) => {
          const splitIndex = x.indexOf("=");
          return {
            name: x.substring(2, splitIndex),
            value: x.substring(splitIndex + 1),
          };
        })
        .reduce((acc, option) => ({ ...acc, [option.name]: option.value }), {});

    if (!OPTION_CACHE_ENABLED) {
      return parseOptions(await this.sendCommand("showoptions"));
    }

    if (!this.optionsCache) {
      this.optionsCache = parseOptions(await this.sendCommand("showoptions"));
    }

    return { ...this.optionsCache };
  }

  public async setOptions(options: ServerOptions): Promise<void> {
    const current = await this.options();
    for (const [key, value] of Object.entries(options)) {
      if (value != current?.[key as keyof ServerOptions]) {
        await this.sendCommand(`changeoption ${key} ${value}`);
        console.log(`Setting option ${key} to ${value}`);
        if (OPTION_CACHE_ENABLED) {
          this.optionsCache = this.optionsCache || {};
          this.optionsCache[key as keyof ServerOptions] = value;
        }
      }
    }
  }

  public async quit(): Promise<void> {
    await this.sendCommand("quit");
    (await this.rcon).end();
  }

  public async end(): Promise<void> {
    this.intentionallyClosed = true;
    (await this.rcon).end();
    this.running = false;
  }
}
