import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { CommandDescriptor, CommandOption } from "./commandsRegistry";

export function buildSlashCommand(desc: CommandDescriptor): SlashCommandBuilder {
  const builder = new SlashCommandBuilder().setName(desc.name).setDescription(desc.description);
  (desc.options || []).forEach((opt) => {
    if (opt.type === "number") {
      builder.addIntegerOption((o) => o.setName(opt.name).setDescription(opt.description || "").setRequired(Boolean(opt.required)));
    } else if (opt.type === "string") {
      builder.addStringOption((o) => o.setName(opt.name).setDescription(opt.description || "").setRequired(Boolean(opt.required)));
    } else if (opt.type === "boolean") {
      builder.addBooleanOption((o) => o.setName(opt.name).setDescription(opt.description || "").setRequired(Boolean(opt.required)));
    }
  });
  return builder;
}

export function extractDiscordArgs(desc: CommandDescriptor, interaction: ChatInputCommandInteraction): Record<string, any> {
  const args: Record<string, any> = {};
  (desc.options || []).forEach((opt) => {
    if (opt.type === "number") {
      args[opt.name] = interaction.options.getInteger(opt.name, Boolean(opt.required));
    } else if (opt.type === "string") {
      args[opt.name] = interaction.options.getString(opt.name, Boolean(opt.required));
    } else if (opt.type === "boolean") {
      args[opt.name] = interaction.options.getBoolean(opt.name, Boolean(opt.required));
    }
  });
  return args;
}

export function mapCliArgs(desc: CommandDescriptor, positional: string[]): Record<string, any> {
  const args: Record<string, any> = {};
  const opts = desc.options || [];
  for (let i = 0; i < opts.length; i++) {
    const opt = opts[i];
    const raw = positional[i];
    if (opt.type === "number") {
      args[opt.name] = raw !== undefined ? Number(raw) : undefined;
    } else if (opt.type === "boolean") {
      args[opt.name] = raw !== undefined ? raw === "true" || raw === "1" : undefined;
    } else {
      args[opt.name] = raw;
    }
  }
  return args;
}
