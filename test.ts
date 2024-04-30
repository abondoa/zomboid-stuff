import {RconClient} from './rcon';
const { host, port, password } = require("./config.json");

async function main() {
    const rcon = new RconClient(host, port, password);
    console.log(await rcon.sendCommand("players"));
    await rcon.end();
}

main()
