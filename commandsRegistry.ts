import { CommandHandler } from "./commands";

export type OptionType = "string" | "number" | "boolean";

export interface CommandOption {
  name: string;
  type: OptionType;
  required?: boolean;
  description?: string;
}

export interface CommandDescriptor {
  name: string;
  description: string;
  options?: CommandOption[];
  executor: (ctx: {
    handler: CommandHandler;
    args: Record<string, any>;
    source: "cli" | "discord";
  }) => Promise<any>;
  visibleInCli?: boolean;
  visibleInDiscord?: boolean;
}

// Central registry of commands — executors delegate to CommandHandler.
export const commands: CommandDescriptor[] = [
  {
    name: "zb-restart",
    description: "Restarts the server",
    executor: async ({ handler }) => {
      return handler.restart();
    },
  },
  {
    name: "zb-players",
    description: "Lists the players currently online",
    executor: async ({ handler }) => {
      return handler.players();
    },
  },
  {
    name: "zb-mods",
    description: "Lists the mods currently active on the server",
    executor: async ({ handler }) => {
      return handler.mods();
    },
  },
  {
    name: "zb-addmod",
    description: "Adds a mod to the server",
    options: [
      { name: "modid", type: "number", required: true, description: "The ID of the mod to add" },
    ],
    executor: async ({ handler, args }) => {
      const modId = Number(args.modid);
      return handler.addmod(modId);
    },
  },
  {
    name: "zb-workshopinfo",
    description: "Look up Steam Workshop mod information",
    options: [
      { name: "workshopid", type: "string", required: true, description: "The Steam Workshop ID to look up" },
    ],
    executor: async ({ handler, args }) => {
      return handler.workshopinfo(String(args.workshopid));
    },
  },
];
