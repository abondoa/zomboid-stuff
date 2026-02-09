import { RconClient } from "./rcon";

export class CommandHandler {
  constructor(private rcon: RconClient) {}

  private zip(mods: string[] | undefined, workshopItems: string[] | undefined) {
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

  private async getWorkshopItems(): Promise<string[]> {
    return (
      (await this.rcon.options()).WorkshopItems?.split(";")?.map((x) =>
        x.trim(),
      ) ?? []
    );
  }

  private async getMods() {
    const workshopItems = await this.getWorkshopItems();
    const mods = await Promise.all(
      workshopItems?.map((x) => this.getModIdFromSteamWorkshop(x)) ?? [],
    );
    return this.zip(mods, workshopItems) ?? [];
  }

  async restart(): Promise<string> {
    const players = await this.rcon.players();
    if (players.length > 0) {
      return "Players are online. No restart for you!";
    } else {
      await this.rcon.quit();
      return "Restart initiated";
    }
  }

  async players(): Promise<string> {
    const playerList = await this.rcon.players();
    return "Players online: " + playerList.join(", ");
  }

  async mods(): Promise<string> {
    const modList = await this.getMods();
    return (
      "Active mods: " +
      modList.map((x) => `${x.mod} (${x.workshopItem})`).join(", ")
    );
  }

  async addworkshopitem(workshopId: number): Promise<string> {
    try {
      const options = await this.rcon.options();

      // Get existing workshop items and check for uniqueness
      const existingWorkshopItems =
        options.WorkshopItems?.split(";")
          ?.map((x) => x.trim())
          .filter((x) => x) ?? [];

      if (existingWorkshopItems.includes(workshopId.toString())) {
        return `Workshop ID ${workshopId} is already in the server's mod list.`;
      }

      // Get the mod name for the new workshop item
      const modName = await this.getModIdFromSteamWorkshop(
        workshopId.toString(),
      );

      // Create new workshop items list
      const newWorkshopItems = [
        ...existingWorkshopItems,
        workshopId.toString(),
      ];

      // Reconstruct the Mods list by getting mod IDs for all workshop items
      const allModIds = await Promise.all(
        newWorkshopItems.map((id) => this.getModIdFromSteamWorkshop(id)),
      );

      // Update options with synced lists
      options.WorkshopItems = newWorkshopItems.join(";");
      options.Mods = allModIds.join(";");
      await this.rcon.setOptions(options);

      return `Mod ${modName} (ID: ${workshopId}) added to server. Server restart required.`;
    } catch (error) {
      return `Failed to add mod: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async workshopinfo(workshopId: string): Promise<string> {
    try {
      const modName = await this.getModIdFromSteamWorkshop(workshopId);
      return `Steam Workshop ID ${workshopId}: ${modName}`;
    } catch (error) {
      return `Failed to look up workshop ID: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private async getModIdFromSteamWorkshop(workshopId: string): Promise<string> {
    try {
      // Use the Steam Web API to get workshop item details
      const url = `https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `itemcount=1&publishedfileids[0]=${workshopId}`,
      });

      const data = (await response.json()) as any;

      if (
        data.response?.result === 1 &&
        data.response?.publishedfiledetails?.length > 0
      ) {
        const fileDetails = data.response.publishedfiledetails[0];

        // Verify that this workshop item is for Project Zomboid (app ID 108600)
        const ZOMBOID_APP_ID = 108600;
        if (fileDetails.creator_app_id !== ZOMBOID_APP_ID) {
          throw new Error(
            `Workshop item ${workshopId} is not for Project Zomboid (app ID: ${fileDetails.creator_app_id})`,
          );
        }

        const description = fileDetails.description || "";

        // Look for "Mod ID: <modid>" in the description
        const modIdMatch = description.match(/Mod\s+ID:\s*(\S+)/i);
        if (modIdMatch && modIdMatch[1]) {
          return modIdMatch[1];
        }

        // Fallback: use the title if Mod ID not found in description
        const title = fileDetails.title || "";
        if (title) {
          let modName = title
            .replace(/^Steam\s+Workshop\s*::\s*/i, "")
            .replace(/^Workshop\s*::\s*/i, "")
            .replace(/\s*\[[^\]]*\]\s*/g, " ")
            .replace(/\s*v?\d+(\.\d+)*\s*$/i, "")
            .replace(/[\s\-:]+$/, "")
            .trim();

          return modName;
        }
      }

      throw new Error("Could not extract mod ID from Steam API");
    } catch (error) {
      console.error(`Error fetching Steam workshop item ${workshopId}:`, error);
      throw error;
    }
  }
}
