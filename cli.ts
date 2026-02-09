import { RconClient } from "./rcon";
import { CommandHandler } from "./commands";
import * as readline from "readline";
const yargs: any = require("yargs");
import { commands as registry } from "./commandsRegistry";

// Build a yargs instance programmatically from registry
function buildYargs(handler: CommandHandler) {
  const y = yargs();
  y.exitProcess(false).help(false);
  registry.forEach((desc: any) => {
    const cmdName = desc.name;
    y.command(
      cmdName,
      desc.description,
      (b: any) => {
        (desc.options || []).forEach((opt: any) => {
          b.option(opt.name, { type: opt.type === "number" ? "number" : opt.type === "boolean" ? "boolean" : "string", demandOption: Boolean(opt.required), describe: opt.description });
        });
        return b;
      },
      async (argv: any) => {
        const args: Record<string, any> = {};
        (desc.options || []).forEach((opt: any) => {
          args[opt.name] = argv[opt.name];
        });
        try {
          const result = await desc.executor({ handler, args, source: "cli" });
          console.log(result);
        } catch (err) {
          console.error("Error:", err instanceof Error ? err.message : String(err));
        }
      },
    );
  });
  return y;
}

export class CLIInterface {
  private rcon: RconClient;
  private commandHandler: CommandHandler;
  private rl: readline.Interface;
  private yargs: any;

  constructor(host: string, port: number, password: string) {
    this.rcon = new RconClient(host, port, password);
    this.commandHandler = new CommandHandler(this.rcon);
    this.rl = readline.createInterface({
      input: process.stdin as any,
      output: process.stdout as any,
    });
    this.yargs = buildYargs(this.commandHandler);
  }

  async start(): Promise<void> {
    console.log("Zombie CLI started. Available commands:");
    console.log("  zb-restart         - Restart the server");
    console.log("  zb-players         - List online players");
    console.log("  zb-mods            - List active mods");
    console.log("  zb-addmod <id>     - Add a mod by Steam Workshop ID");
    console.log("  zb-workshopinfo <id> - Look up Steam Workshop ID info");
    console.log("  exit               - Exit the CLI");
    console.log("");

    this.prompt();
  }

  private prompt(): void {
    this.rl.question("> ", async (input) => {
      const tokens = input.trim().split(/\s+/).filter(Boolean);
      if (!tokens.length) {
        this.prompt();
        return;
      }

      // Support local exit commands
      const cmd = tokens[0].toLowerCase();
      if (cmd === "exit" || cmd === "quit") {
        console.log("Goodbye!");
        await this.rcon.end();
        this.rl.close();
        process.exit(0);
      }

      try {
        // Parse via yargs (registered commands will run their handler)
        await this.yargs.parse(tokens);
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : String(error));
      }

      this.prompt();
    });
  }
}
