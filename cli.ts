import { RconClient } from "./rcon";
import { CommandHandler } from "./commands";
import * as readline from "readline";

export class CLIInterface {
  private rcon: RconClient;
  private commandHandler: CommandHandler;
  private rl: readline.Interface;

  constructor(host: string, port: number, password: string) {
    this.rcon = new RconClient(host, port, password);
    this.commandHandler = new CommandHandler(this.rcon);
    this.rl = readline.createInterface({
      input: process.stdin as any,
      output: process.stdout as any,
    });
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
      const [command, ...args] = input.trim().split(/\s+/);

      if (!command) {
        this.prompt();
        return;
      }

      try {
        let response = "";

        switch (command.toLowerCase()) {
          case "zb-restart":
            response = await this.commandHandler.restart();
            break;
          case "zb-players":
            response = await this.commandHandler.players();
            break;
          case "zb-mods":
            response = await this.commandHandler.mods();
            break;
          case "zb-addmod":
            if (args.length === 0) {
              response = "Usage: zb-addmod <modid>";
            } else {
              const modId = parseInt(args[0], 10);
              if (isNaN(modId)) {
                response = "Error: Mod ID must be a number";
              } else {
                response = await this.commandHandler.addmod(modId);
              }
            }
            break;
          case "zb-workshopinfo":
            if (args.length === 0) {
              response = "Usage: zb-workshopinfo <workshopid>";
            } else {
              response = await this.commandHandler.workshopinfo(args[0]);
            }
            break;
          case "exit":
          case "quit":
            console.log("Goodbye!");
            await this.rcon.end();
            this.rl.close();
            process.exit(0);
            break;
          default:
            response = `Unknown command: ${command}`;
        }

        console.log(response);
        this.prompt();
      } catch (error) {
        console.error(
          "Error:",
          error instanceof Error ? error.message : String(error),
        );
        this.prompt();
      }
    });
  }
}
